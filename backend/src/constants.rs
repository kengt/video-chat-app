pub mod user {
    pub mod role {
        pub const ADMIN: i32 = 1;
        pub const USER: i32 = 2;
    }
    pub mod status {
        pub const ACTIVE: i32 = 1;
        pub const DELETED: i32 = 2;
        pub const _UNAPPROVED: i32 = 3;
    }
}

pub mod contact {
    pub mod status {
        pub const UNAPPROVED: i32 = 1;
        pub const APPROVED: i32 = 2;
        pub const DELETED: i32 = 3;
    }
}

pub mod message {
    pub mod category {
        pub const CONTACT_APPLICATION: i32 = 1;
        pub const CONTACT_APPROVAL: i32 = 2;
        pub const MESSAGE: i32 = 3;
        pub const _CALLING: i32 = 4;
        pub const _FILE_TRANSMISSION: i32 = 5;
    }
    pub mod status {
        pub const UNREAD: i32 = 1;
        pub const READ: i32 = 2;
        pub const DELETED: i32 = 3;
    }
}