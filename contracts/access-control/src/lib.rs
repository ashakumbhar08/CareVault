#![no_std]

mod errors;
mod events;
mod storage;
mod types;

use soroban_sdk::{contract, contractimpl, Address, Env, Vec};

use errors::ContractError;
use events::{emit_grant_created, emit_grant_revoked};
use storage::{
    get_doctor_grants, get_grant, get_grant_counter, get_patient_grants, has_admin, set_admin,
    set_doctor_grants, set_grant, set_grant_counter, set_patient_grants,
};
use types::AccessGrant;

#[contract]
pub struct AccessControlContract;

#[contractimpl]
impl AccessControlContract {
    pub fn initialize(env: Env, admin: Address) -> Result<(), ContractError> {
        if has_admin(&env) {
            return Err(ContractError::AlreadyInitialized);
        }
        set_admin(&env, &admin);
        set_grant_counter(&env, 0);
        Ok(())
    }

    pub fn grant_access(
        env: Env,
        patient: Address,
        doctor: Address,
        record_ids: Vec<u64>,
        expires_at: u64,
    ) -> Result<u64, ContractError> {
        patient.require_auth();

        let current_time = env.ledger().timestamp();
        if expires_at <= current_time {
            return Err(ContractError::InvalidExpiry);
        }

        let grant_id = get_grant_counter(&env) + 1;
        set_grant_counter(&env, grant_id);

        let grant = AccessGrant {
            grant_id,
            patient: patient.clone(),
            doctor: doctor.clone(),
            record_ids,
            granted_at: current_time,
            expires_at,
            is_active: true,
        };

        set_grant(&env, &grant);

        let mut patient_grants = get_patient_grants(&env, &patient);
        patient_grants.push_back(grant_id);
        set_patient_grants(&env, &patient, &patient_grants);

        let mut doctor_grants = get_doctor_grants(&env, &doctor);
        doctor_grants.push_back(grant_id);
        set_doctor_grants(&env, &doctor, &doctor_grants);

        emit_grant_created(&env, grant_id, patient, doctor, expires_at);

        Ok(grant_id)
    }

    pub fn revoke_access(env: Env, patient: Address, grant_id: u64) -> Result<bool, ContractError> {
        patient.require_auth();

        let mut grant = get_grant(&env, grant_id).ok_or(ContractError::GrantNotFound)?;

        if grant.patient != patient {
            return Err(ContractError::Unauthorized);
        }

        grant.is_active = false;
        set_grant(&env, &grant);

        emit_grant_revoked(&env, grant_id, patient, grant.doctor.clone());

        Ok(true)
    }

    pub fn get_active_grants(env: Env, patient: Address) -> Vec<AccessGrant> {
        let grant_ids = get_patient_grants(&env, &patient);
        let mut active_grants = Vec::new(&env);
        let current_time = env.ledger().timestamp();

        for grant_id in grant_ids.iter() {
            if let Some(grant) = get_grant(&env, grant_id) {
                if grant.is_active && grant.expires_at > current_time {
                    active_grants.push_back(grant);
                }
            }
        }

        active_grants
    }

    pub fn check_access(env: Env, doctor: Address, patient: Address) -> bool {
        let grant_ids = get_doctor_grants(&env, &doctor);
        let current_time = env.ledger().timestamp();

        for grant_id in grant_ids.iter() {
            if let Some(grant) = get_grant(&env, grant_id) {
                if grant.patient == patient
                    && grant.is_active
                    && grant.expires_at > current_time
                {
                    return true;
                }
            }
        }

        false
    }

    pub fn get_doctor_grants(env: Env, doctor: Address) -> Vec<AccessGrant> {
        let grant_ids = get_doctor_grants(&env, &doctor);
        let mut active_grants = Vec::new(&env);
        let current_time = env.ledger().timestamp();

        for grant_id in grant_ids.iter() {
            if let Some(grant) = get_grant(&env, grant_id) {
                if grant.is_active && grant.expires_at > current_time {
                    active_grants.push_back(grant);
                }
            }
        }

        active_grants
    }

    pub fn get_grant(env: Env, grant_id: u64) -> Result<AccessGrant, ContractError> {
        get_grant(&env, grant_id).ok_or(ContractError::GrantNotFound)
    }
}

#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::{testutils::Address as _, Env, Vec};

    #[test]
    fn test_initialize() {
        let env = Env::default();
        let contract_id = env.register_contract(None, AccessControlContract);
        let client = AccessControlContractClient::new(&env, &contract_id);

        let admin = Address::generate(&env);

        client.initialize(&admin);

        assert_eq!(storage::get_admin(&env), admin);
    }

    #[test]
    fn test_grant_access() {
        let env = Env::default();
        env.mock_all_auths();
        let contract_id = env.register_contract(None, AccessControlContract);
        let client = AccessControlContractClient::new(&env, &contract_id);

        let admin = Address::generate(&env);
        let patient = Address::generate(&env);
        let doctor = Address::generate(&env);

        client.initialize(&admin);

        let mut record_ids = Vec::new(&env);
        record_ids.push_back(1);
        record_ids.push_back(2);

        let expires_at = env.ledger().timestamp() + 2592000;
        let grant_id = client.grant_access(&patient, &doctor, &record_ids, &expires_at);

        assert_eq!(grant_id, 1);

        let grant = client.get_grant(&grant_id);
        assert_eq!(grant.patient, patient);
        assert_eq!(grant.doctor, doctor);
        assert_eq!(grant.is_active, true);
    }

    #[test]
    fn test_revoke_access() {
        let env = Env::default();
        env.mock_all_auths();
        let contract_id = env.register_contract(None, AccessControlContract);
        let client = AccessControlContractClient::new(&env, &contract_id);

        let admin = Address::generate(&env);
        let patient = Address::generate(&env);
        let doctor = Address::generate(&env);

        client.initialize(&admin);

        let mut record_ids = Vec::new(&env);
        record_ids.push_back(1);

        let expires_at = env.ledger().timestamp() + 2592000;
        let grant_id = client.grant_access(&patient, &doctor, &record_ids, &expires_at);

        client.revoke_access(&patient, &grant_id);

        let grants = client.get_active_grants(&patient);
        assert_eq!(grants.len(), 0);
    }

    #[test]
    fn test_check_access() {
        let env = Env::default();
        env.mock_all_auths();
        let contract_id = env.register_contract(None, AccessControlContract);
        let client = AccessControlContractClient::new(&env, &contract_id);

        let admin = Address::generate(&env);
        let patient = Address::generate(&env);
        let doctor = Address::generate(&env);

        client.initialize(&admin);

        let mut record_ids = Vec::new(&env);
        record_ids.push_back(1);

        let expires_at = env.ledger().timestamp() + 2592000;
        client.grant_access(&patient, &doctor, &record_ids, &expires_at);

        let has_access = client.check_access(&doctor, &patient);
        assert_eq!(has_access, true);
    }

    #[test]
    fn test_expired_grant_excluded() {
        let env = Env::default();
        env.mock_all_auths();
        let contract_id = env.register_contract(None, AccessControlContract);
        let client = AccessControlContractClient::new(&env, &contract_id);

        let admin = Address::generate(&env);
        let patient = Address::generate(&env);
        let doctor = Address::generate(&env);

        client.initialize(&admin);

        let mut record_ids = Vec::new(&env);
        record_ids.push_back(1);

        let expires_at = env.ledger().timestamp() - 1;
        let result = client.try_grant_access(&patient, &doctor, &record_ids, &expires_at);

        assert!(result.is_err());
    }

    #[test]
    #[should_panic(expected = "Unauthorized")]
    fn test_unauthorized_revoke() {
        let env = Env::default();
        env.mock_all_auths();
        let contract_id = env.register_contract(None, AccessControlContract);
        let client = AccessControlContractClient::new(&env, &contract_id);

        let admin = Address::generate(&env);
        let patient = Address::generate(&env);
        let doctor = Address::generate(&env);
        let attacker = Address::generate(&env);

        client.initialize(&admin);

        let mut record_ids = Vec::new(&env);
        record_ids.push_back(1);

        let expires_at = env.ledger().timestamp() + 2592000;
        let grant_id = client.grant_access(&patient, &doctor, &record_ids, &expires_at);

        env.mock_all_auths_allowing_non_root_auth();
        client.revoke_access(&attacker, &grant_id);
    }
}
