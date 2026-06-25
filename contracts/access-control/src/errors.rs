use soroban_sdk::contracterror;

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq)]
pub enum ContractError {
    AlreadyInitialized = 1,
    GrantNotFound = 2,
    Unauthorized = 3,
    InvalidExpiry = 4,
    AccessDenied = 5,
}
