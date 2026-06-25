use soroban_sdk::contracterror;

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq)]
pub enum ContractError {
    AlreadyInitialized = 1,
    RecordNotFound = 2,
    Unauthorized = 3,
    InvalidCategory = 4,
}
