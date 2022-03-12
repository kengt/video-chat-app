use crate::auth::Role;
use crate::graphql::common;
use async_graphql::*;

pub struct RoleGuard {
    role: Role,
}

impl RoleGuard {
    pub fn new(role: Role) -> Self {
        Self { role }
    }
}

#[async_trait::async_trait]
impl Guard for RoleGuard {
    async fn check(&self, ctx: &Context<'_>) -> Result<()> {
        match common::get_identity_from_ctx(ctx) {
            Some(identity) => {
                if self.role != Role::Guest {
                    if (identity.role == self.role) || (identity.role == Role::Admin) {
                        return Ok(());
                    }
                }
            }
            None => {
                if self.role == Role::Guest {
                    return Ok(());
                }
            }
        }

        Err("Forbidden".into())
    }
}
