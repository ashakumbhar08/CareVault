use soroban_sdk::{symbol_short, Address, Env, Symbol, Vec};

use crate::types::MedicalRecord;

const MIN_TTL: u32 = 100;
const TARGET_TTL: u32 = 500;

pub const ADMIN_KEY: Symbol = symbol_short!("ADMIN");
pub const RECORD_COUNTER_KEY: Symbol = symbol_short!("REC_CNT");

#[derive(Clone)]
pub enum StorageKey {
    Admin,
    RecordCounter,
    Record(u64),
    PatientRecords(Address),
}

pub fn get_admin(env: &Env) -> Address {
    env.storage().instance().get(&ADMIN_KEY).unwrap()
}

pub fn set_admin(env: &Env, admin: &Address) {
    env.storage().instance().set(&ADMIN_KEY, admin);
}

pub fn has_admin(env: &Env) -> bool {
    env.storage().instance().has(&ADMIN_KEY)
}

pub fn get_record_counter(env: &Env) -> u64 {
    env.storage()
        .instance()
        .get(&RECORD_COUNTER_KEY)
        .unwrap_or(0)
}

pub fn set_record_counter(env: &Env, counter: u64) {
    env.storage().instance().set(&RECORD_COUNTER_KEY, &counter);
}

pub fn get_record(env: &Env, record_id: u64) -> Option<MedicalRecord> {
    let key = (symbol_short!("RECORD"), record_id);
    if env.storage().persistent().has(&key) {
        env.storage().persistent().extend_ttl(&key, MIN_TTL, TARGET_TTL);
        env.storage().persistent().get(&key)
    } else {
        None
    }
}

pub fn set_record(env: &Env, record: &MedicalRecord) {
    let key = (symbol_short!("RECORD"), record.record_id);
    env.storage().persistent().set(&key, record);
    env.storage().persistent().extend_ttl(&key, MIN_TTL, TARGET_TTL);
}

pub fn get_patient_records(env: &Env, patient: &Address) -> Vec<u64> {
    let key = (symbol_short!("PAT_RECS"), patient);
    if env.storage().persistent().has(&key) {
        env.storage().persistent().extend_ttl(&key, MIN_TTL, TARGET_TTL);
        env.storage().persistent().get(&key).unwrap_or(Vec::new(env))
    } else {
        Vec::new(env)
    }
}

pub fn set_patient_records(env: &Env, patient: &Address, records: &Vec<u64>) {
    let key = (symbol_short!("PAT_RECS"), patient);
    env.storage().persistent().set(&key, records);
    env.storage().persistent().extend_ttl(&key, MIN_TTL, TARGET_TTL);
}
