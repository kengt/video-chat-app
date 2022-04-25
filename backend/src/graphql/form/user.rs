use async_graphql::*;

#[derive(InputObject)]
pub struct SignInInput {
    pub email: String,
    pub password: String,
}

#[derive(InputObject)]
pub struct SignUpInput {
    pub code: String,
    pub name: String,
    pub email: String,
    pub password: String,
    pub password_confirm: String,
    pub comment: Option<String>,
    pub avatar: Option<String>,
}

#[derive(InputObject)]
pub struct EditProfileInput {
    pub code: String,
    pub name: String,
    pub email: String,
    pub comment: Option<String>,
    pub avatar: Option<String>,
}

#[derive(InputObject)]
pub struct ChangePasswordInput {
    pub password: String,
    pub new_password: String,
    pub new_password_confirm: String,
}