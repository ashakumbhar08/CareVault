use soroban_sdk::{contracttype, Address, Bytes};

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum RecordCategory {
    Prescription = 0,
    LabReport = 1,
    Scan = 2,
    Vaccination = 3,
    DischargeSummary = 4,
    Other = 5,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum VerificationStatus {
    Pending = 0,
    Verified = 1,
    Failed = 2,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct MedicalRecord {
    pub record_id: u64,
    pub patient: Address,
    pub ipfs_hash: Bytes,
    pub category: RecordCategory,
    pub uploaded_at: u64,
    pub file_size_kb: u32,
    pub verification_status: VerificationStatus,
    pub is_active: bool,
}

impl RecordCategory {
    pub fn from_u32(value: u32) -> Result<Self, ()> {
        match value {
            0 => Ok(RecordCategory::Prescription),
            1 => Ok(RecordCategory::LabReport),
            2 => Ok(RecordCategory::Scan),
            3 => Ok(RecordCategory::Vaccination),
            4 => Ok(RecordCategory::DischargeSummary),
            5 => Ok(RecordCategory::Other),
            _ => Err(()),
        }
    }
}

impl VerificationStatus {
    pub fn from_u32(value: u32) -> Result<Self, ()> {
        match value {
            0 => Ok(VerificationStatus::Pending),
            1 => Ok(VerificationStatus::Verified),
            2 => Ok(VerificationStatus::Failed),
            _ => Err(()),
        }
    }
}
