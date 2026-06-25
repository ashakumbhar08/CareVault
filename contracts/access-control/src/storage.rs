use soroban_sdk::{symbol_short, Address, Env, Symbol, Vec};

use crate::types::AccessGrant;

const MIN_TTL: u32 = 100;
const TARGET_TTL: u32 = 500;

pub const ADMIN_KEY: Symbol = symbol_short!("ADMIN");
pub const GRANT_COUNTER_KEY: Symbol = symbol_short!("GRT_CNT");

pub fn get_admin(env: &Env) -> Address {
    env.storage().instance().get(&ADMIN_KEY).unwrap()
}

pub fn set_admin(env: &Env, admin: &Address) {
    env.storage().instance().set(&ADMIN_KEY, admin);
}

pub fn has_admin(env: &Env) -> bool {
    env.storage().instance().has(&ADMIN_KEY)
}

pub fn get_grant_counter(env: &Env) -> u64 {
    env.storage()
        .instance()
        .get(&GRANT_COUNTER_KEY)
        .unwrap_or(0)
}

pub fn set_grant_counter(env: &Env, counter: u64) {
    env.storage().instance().set(&GRANT_COUNTER_KEY, &counter);
}

pub fn get_grant(env: &Env, grant_id: u64) -> Option<AccessGrant> {
    let key = (symbol_short!("GRANT"), grant_id);
    if env.storage().persistent().has(&key) {
        env.storage().persistent().extend_ttl(&key, MIN_TTL, TARGET_TTL);
        env.storage().persistent().get(&key)
    } else {
        None
    }
}

pub fn set_grant(env: &Env, grant: &AccessGrant) {
    let key = (symbol_short!("GRANT"), grant.grant_id);
    env.storage().persistent().set(&key, grant);
    env.storage().persistent().extend_ttl(&key, MIN_TTL, TARGET_TTL);
}

pub fn get_patient_grants(env: &Env, patient: &Address) -> Vec<u64> {
    let key = (symbol_short!("PAT_GRT"), patient);
    if env.storage().persistent().has(&key) {
        env.storage().persistent().extend_ttl(&key, MIN_TTL, TARGET_TTL);
        env.storage().persistent().get(&key).unwrap_or(Vec::new(env))
    } else {
        Vec::new(env)
    }
}

pub fn set_patient_grants(env: &Env, patient: &Address, grants: &Vec<u64>) {
    let key = (symbol_short!("PAT_GRT"), patient);
    env.storage().persistent().set(&key, grants);
    env.storage().persistent().extend_ttl(&key, MIN_TTL, TARGET_TTL);
}

pub fn get_doctor_grants(env: &Env, doctor: &Address) -> Vec<u64> {
    let key = (symbol_short!("DOC_GRT"), doctor);
    if env.storage().persistent().has(&key) {
        env.storage().persistent().extend_ttl(&key, MIN_TTL, TARGET_TTL);
        env.storage().persistent().get(&key).unwrap_or(Vec::new(env))
    } else {
        Vec::new(env)
    }
}

pub fn set_doctor_grants(env: &Env, doctor: &Address, grants: &Vec<u64>) {
    let key = (symbol_short!("DOC_GRT"), doctor);
    env.storage().persistent().set(&key, grants);
    env.storage().persistent().extend_ttl(&key, MIN_TTL, TARGET_TTL);
}
