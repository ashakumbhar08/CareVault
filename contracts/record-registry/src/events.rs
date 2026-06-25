use soroban_sdk::{symbol_short, Address, Bytes, Env};

use crate::types::{RecordCategory, VerificationStatus};

pub fn emit_record_uploaded(
    env: &Env,
    record_id: u64,
    patient: Address,
    category: RecordCategory,
    ipfs_hash: Bytes,
) {
    env.events().publish(
        (symbol_short!("carevault"), symbol_short!("rec_up")),
        (record_id, patient, category, ipfs_hash),
    );
}

pub fn emit_record_verified(env: &Env, record_id: u64, status: VerificationStatus) {
    env.events().publish(
        (symbol_short!("carevault"), symbol_short!("rec_ver")),
        (record_id, status),
    );
}

pub fn emit_record_deleted(env: &Env, record_id: u64, patient: Address) {
    env.events().publish(
        (symbol_short!("carevault"), symbol_short!("rec_del")),
        (record_id, patient),
    );
}
