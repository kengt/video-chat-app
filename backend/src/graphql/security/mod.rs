pub mod auth;
pub mod crypto;
pub mod guard;
pub mod validator;

use crate::constant::system::PASSWORD_SECRET_KEY;
use argonautica::Error;
use async_graphql::Result;
use crypto::hash;

pub use guard::{ResourceGuard, RoleGuard};

pub fn password_hash(password: &str) -> Result<String, Error> {
    hash::make(password, PASSWORD_SECRET_KEY.as_str())
}

pub fn password_verify(hash: &str, password: &str) -> Result<bool, Error> {
    hash::verify(hash, password, PASSWORD_SECRET_KEY.as_str())
}
