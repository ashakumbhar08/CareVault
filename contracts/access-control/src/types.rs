use soroban_sdk::{contracttype, Address, Vec};

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct AccessGrant {
    pub grant_id: u64,
    pub patient: Address,
    pub doctor: Address,
    pub record_ids: Vec<u64>,
    pub granted_at: u64,
    pub expires_at: u64,
    pub is_active: bool,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum GrantStatus {
    Active = 0,
    Expired = 1,
    Revoked = 2,
}
