use crate::database::entity::LatestMessageEntity;
use async_graphql::*;

#[derive(Clone, Debug)]
pub struct ChatHistory {
    pub user_id: u64,
    pub user_code: String,
    pub user_name: Option<String>,
    pub user_avatar: Option<String>,
    pub message_id: u64,
    pub message_category: i32,
    pub message: Option<String>,
}

impl From<&LatestMessageEntity> for ChatHistory {
    fn from(entity: &LatestMessageEntity) -> Self {
        Self {
            user_id: entity.user_id,
            user_code: entity.user_code.clone(),
            user_name: entity.user_name.clone(),
            user_avatar: entity.user_avatar.clone(),
            message_id: entity.message_id,
            message_category: entity.message_category,
            message: entity.message.clone(),
        }
    }
}

#[Object]
impl ChatHistory {
    async fn user_id(&self) -> ID {
        self.user_id.into()
    }

    async fn user_code(&self) -> &str {
        self.user_code.as_str()
    }

    async fn user_name(&self) -> Option<&str> {
        self.user_name.as_deref()
    }

    async fn user_avatar(&self) -> Option<&str> {
        self.user_avatar.as_deref()
    }

    async fn message_id(&self) -> ID {
        self.message_id.into()
    }

    async fn message_category(&self) -> i32 {
        self.message_category
    }

    async fn message(&self) -> Option<&str> {
        self.message.as_deref()
    }
}