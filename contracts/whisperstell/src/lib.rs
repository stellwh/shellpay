#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, Address, Bytes, Env, Symbol, symbol_short};

// Role levels
#[contracttype]
#[derive(Clone, PartialEq)]
pub enum Role {
    Owner,
    Admin,
    Member,
    ReadOnly,
}

// Storage keys
#[contracttype]
pub enum DataKey {
    Group(Bytes),        // group_id -> creator
    Role(Bytes, Address), // (group_id, member) -> Role
}

#[contract]
pub struct WhisperStell;

#[contractimpl]
impl WhisperStell {
    /// Anchors a new group on-chain.
    /// group_id: a hash/memo that uniquely identifies the group (computed off-chain).
    /// Caller becomes the Owner.
    pub fn create_group(env: Env, group_id: Bytes, creator: Address) {
        creator.require_auth();

        let key = DataKey::Group(group_id.clone());
        assert!(
            !env.storage().persistent().has(&key),
            "group already exists"
        );

        // Store creator address as group anchor
        env.storage().persistent().set(&key, &creator);

        // Assign Owner role to creator
        let role_key = DataKey::Role(group_id, creator);
        env.storage().persistent().set(&role_key, &Role::Owner);

        env.events().publish((symbol_short!("grp_new"),), ());
    }

    /// Sets the role of a member within a group.
    /// Only Owner or Admin can assign roles.
    /// Only Owner can assign the Admin role.
    pub fn set_group_role(
        env: Env,
        group_id: Bytes,
        caller: Address,
        target: Address,
        role: Role,
    ) {
        caller.require_auth();

        // Group must exist
        let group_key = DataKey::Group(group_id.clone());
        assert!(
            env.storage().persistent().has(&group_key),
            "group not found"
        );

        // Fetch caller's current role
        let caller_role_key = DataKey::Role(group_id.clone(), caller.clone());
        let caller_role: Role = env
            .storage()
            .persistent()
            .get(&caller_role_key)
            .expect("caller is not a group member");

        // Only Owner can assign Admin
        if role == Role::Owner || role == Role::Admin {
            assert!(caller_role == Role::Owner, "only owner can assign admin or transfer ownership");
        } else {
            assert!(
                caller_role == Role::Owner || caller_role == Role::Admin,
                "insufficient permissions"
            );
        }

        let target_role_key = DataKey::Role(group_id, target);
        env.storage().persistent().set(&target_role_key, &role);

        env.events().publish((symbol_short!("role_set"),), ());
    }
}
