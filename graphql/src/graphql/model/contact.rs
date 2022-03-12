use super::Message;
use crate::database::entity::{ContactEntity, UserEntity};
use crate::database::service;
use crate::graphql::common;
use async_graphql::*;

#[derive(Clone, Debug)]
pub struct Contact {
    pub id: ID,
    pub user_id: ID,
    pub user_code: String,
    pub user_name: Option<String>,
    pub user_avatar: Option<String>,
    pub status: i32,
    pub blocked: bool,
}

impl From<&(ContactEntity, UserEntity)> for Contact {
    fn from((contact, user): &(ContactEntity, UserEntity)) -> Self {
        Self {
            id: contact.id.into(),
            user_id: user.id.into(),
            user_code: user.code.clone(),
            user_name: user.name.clone(),
            user_avatar: user.avatar.clone(),
            status: contact.status,
            blocked: contact.blocked,
        }
    }
}

#[Object]
impl Contact {
    async fn id(&self) -> &ID {
        &self.id
    }

    async fn user_id(&self) -> &ID {
        &self.user_id
    }

    async fn user_code(&self) -> &str {
        self.user_code.as_str()
    }

    async fn user_name(&self, ctx: &Context<'_>) -> Option<&str> {
        let identity = common::get_identity_from_ctx(ctx).expect("Unable to get signed-in user");
        if identity.id == common::convert_id(&self.user_id) {
            return Some("Myspace");
        }
        self.user_name.as_deref()
    }

    async fn user_avatar(&self) -> Option<&str> {
        self.user_avatar.as_deref()
    }

    async fn status(&self) -> i32 {
        self.status
    }

    async fn blocked(&self) -> bool {
        self.blocked
    }

    async fn chat(&self, ctx: &Context<'_>, limit: Option<i64>) -> Vec<Message> {
        if self.blocked {
            return Vec::new();
        }

        let conn = common::get_conn_from_ctx(ctx);
        let identity = common::get_identity_from_ctx(ctx).expect("Unable to get signed-in user");
        service::get_messages(identity.id, common::convert_id(&self.user_id), limit, &conn)
            .expect("Failed to get chat")
            .iter()
            .map(Message::from)
            .rev()
            .collect()
    }
}
