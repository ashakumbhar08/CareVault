#![no_std]

mod errors;
mod events;
mod storage;
mod types;

use soroban_sdk::{contract, contractimpl, Address, Bytes, Env, Vec};

use errors::ContractError;
use events::{emit_record_deleted, emit_record_uploaded, emit_record_verified};
use storage::{
    get_admin, get_patient_records, get_record, get_record_counter, has_admin, set_admin,
    set_patient_records, set_record, set_record_counter,
};
use types::{MedicalRecord, RecordCategory, VerificationStatus};

#[contract]
pub struct RecordRegistryContract;

#[contractimpl]
impl RecordRegistryContract {
    pub fn initialize(env: Env, admin: Address) -> Result<(), ContractError> {
        if has_admin(&env) {
            return Err(ContractError::AlreadyInitialized);
        }
        set_admin(&env, &admin);
        set_record_counter(&env, 0);
        Ok(())
    }

    pub fn upload_record(
        env: Env,
        patient: Address,
        ipfs_hash: Bytes,
        category: u32,
        file_size_kb: u32,
    ) -> Result<u64, ContractError> {
        patient.require_auth();

        let category_enum = RecordCategory::from_u32(category)
            .map_err(|_| ContractError::InvalidCategory)?;

        let record_id = get_record_counter(&env) + 1;
        set_record_counter(&env, record_id);

        let record = MedicalRecord {
            record_id,
            patient: patient.clone(),
            ipfs_hash: ipfs_hash.clone(),
            category: category_enum.clone(),
            uploaded_at: env.ledger().timestamp(),
            file_size_kb,
            verification_status: VerificationStatus::Pending,
            is_active: true,
        };

        set_record(&env, &record);

        let mut patient_records = get_patient_records(&env, &patient);
        patient_records.push_back(record_id);
        set_patient_records(&env, &patient, &patient_records);

        emit_record_uploaded(&env, record_id, patient, category_enum, ipfs_hash);

        Ok(record_id)
    }

    pub fn get_records(env: Env, patient: Address) -> Vec<MedicalRecord> {
        let record_ids = get_patient_records(&env, &patient);
        let mut records = Vec::new(&env);

        for record_id in record_ids.iter() {
            if let Some(record) = get_record(&env, record_id) {
                if record.is_active {
                    records.push_back(record);
                }
            }
        }

        records
    }

    pub fn verify_record(
        env: Env,
        record_id: u64,
        status: u32,
    ) -> Result<bool, ContractError> {
        let admin = get_admin(&env);
        admin.require_auth();

        let mut record = get_record(&env, record_id)
            .ok_or(ContractError::RecordNotFound)?;

        let status_enum = VerificationStatus::from_u32(status)
            .map_err(|_| ContractError::InvalidCategory)?;

        record.verification_status = status_enum.clone();
        set_record(&env, &record);

        emit_record_verified(&env, record_id, status_enum);

        Ok(true)
    }

    pub fn delete_record(
        env: Env,
        patient: Address,
        record_id: u64,
    ) -> Result<bool, ContractError> {
        patient.require_auth();

        let mut record = get_record(&env, record_id)
            .ok_or(ContractError::RecordNotFound)?;

        if record.patient != patient {
            return Err(ContractError::Unauthorized);
        }

        record.is_active = false;
        set_record(&env, &record);

        emit_record_deleted(&env, record_id, patient);

        Ok(true)
    }

    pub fn get_record(env: Env, record_id: u64) -> Result<MedicalRecord, ContractError> {
        get_record(&env, record_id).ok_or(ContractError::RecordNotFound)
    }
}

#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::{testutils::Address as _, Env};

    #[test]
    fn test_initialize() {
        let env = Env::default();
        let contract_id = env.register_contract(None, RecordRegistryContract);
        let client = RecordRegistryContractClient::new(&env, &contract_id);

        let admin = Address::generate(&env);

        client.initialize(&admin);

        assert_eq!(storage::get_admin(&env), admin);
    }

    #[test]
    fn test_upload_record() {
        let env = Env::default();
        env.mock_all_auths();
        let contract_id = env.register_contract(None, RecordRegistryContract);
        let client = RecordRegistryContractClient::new(&env, &contract_id);

        let admin = Address::generate(&env);
        let patient = Address::generate(&env);

        client.initialize(&admin);

        let ipfs_hash = Bytes::from_slice(&env, b"QmTestHash123");
        let record_id = client.upload_record(&patient, &ipfs_hash, &1, &512);

        assert_eq!(record_id, 1);

        let record = client.get_record(&record_id);
        assert_eq!(record.patient, patient);
        assert_eq!(record.ipfs_hash, ipfs_hash);
        assert_eq!(record.file_size_kb, 512);
        assert_eq!(record.is_active, true);
    }

    #[test]
    fn test_get_records() {
        let env = Env::default();
        env.mock_all_auths();
        let contract_id = env.register_contract(None, RecordRegistryContract);
        let client = RecordRegistryContractClient::new(&env, &contract_id);

        let admin = Address::generate(&env);
        let patient = Address::generate(&env);

        client.initialize(&admin);

        let ipfs_hash1 = Bytes::from_slice(&env, b"QmTestHash1");
        let ipfs_hash2 = Bytes::from_slice(&env, b"QmTestHash2");

        client.upload_record(&patient, &ipfs_hash1, &1, &512);
        client.upload_record(&patient, &ipfs_hash2, &2, &1024);

        let records = client.get_records(&patient);
        assert_eq!(records.len(), 2);
    }

    #[test]
    fn test_verify_record() {
        let env = Env::default();
        env.mock_all_auths();
        let contract_id = env.register_contract(None, RecordRegistryContract);
        let client = RecordRegistryContractClient::new(&env, &contract_id);

        let admin = Address::generate(&env);
        let patient = Address::generate(&env);

        client.initialize(&admin);

        let ipfs_hash = Bytes::from_slice(&env, b"QmTestHash");
        let record_id = client.upload_record(&patient, &ipfs_hash, &1, &512);

        client.verify_record(&record_id, &1);

        let record = client.get_record(&record_id);
        assert_eq!(record.verification_status, VerificationStatus::Verified);
    }

    #[test]
    fn test_delete_record() {
        let env = Env::default();
        env.mock_all_auths();
        let contract_id = env.register_contract(None, RecordRegistryContract);
        let client = RecordRegistryContractClient::new(&env, &contract_id);

        let admin = Address::generate(&env);
        let patient = Address::generate(&env);

        client.initialize(&admin);

        let ipfs_hash = Bytes::from_slice(&env, b"QmTestHash");
        let record_id = client.upload_record(&patient, &ipfs_hash, &1, &512);

        client.delete_record(&patient, &record_id);

        let records = client.get_records(&patient);
        assert_eq!(records.len(), 0);
    }

    #[test]
    #[should_panic(expected = "Unauthorized")]
    fn test_unauthorized_delete() {
        let env = Env::default();
        env.mock_all_auths();
        let contract_id = env.register_contract(None, RecordRegistryContract);
        let client = RecordRegistryContractClient::new(&env, &contract_id);

        let admin = Address::generate(&env);
        let patient = Address::generate(&env);
        let attacker = Address::generate(&env);

        client.initialize(&admin);

        let ipfs_hash = Bytes::from_slice(&env, b"QmTestHash");
        let record_id = client.upload_record(&patient, &ipfs_hash, &1, &512);

        env.mock_all_auths_allowing_non_root_auth();
        client.delete_record(&attacker, &record_id);
    }
}
