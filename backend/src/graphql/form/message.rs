use async_graphql::*;

#[derive(InputObject)]
pub struct SendMessageInput {
    pub contact_id: ID,
    pub message: String,
}

#[derive(InputObject)]
pub struct CallOfferInput {
    pub contact_id: ID,
    pub data: String,
}
