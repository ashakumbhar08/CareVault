use soroban_sdk::{symbol_short, Address, Env};

pub fn emit_grant_created(
    env: &Env,
    grant_id: u64,
    patient: Address,
    doctor: Address,
    expires_at: u64,
) {
    env.events().publish(
        (symbol_short!("carevault"), symbol_short!("grt_cre")),
        (grant_id, patient, doctor, expires_at),
    );
}

pub fn emit_grant_revoked(env: &Env, grant_id: u64, patient: Address, doctor: Address) {
    env.events().publish(
        (symbol_short!("carevault"), symbol_short!("grt_rev")),
        (grant_id, patient, doctor),
    );
}
