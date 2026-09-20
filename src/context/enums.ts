export * from "@monadiam/shared";

export enum ResponseViewType {
    /* eslint-disable prettier/prettier */
    DETAILED = "DETAILED",
    COMPACT  = "COMPACT",
    /* eslint-enable prettier/prettier */
}

/** @public */
export enum QueryMode {
    /* eslint-disable prettier/prettier */
    DEFAULT = "DEFAULT",
    MANAGE  = "MANAGE",
    /* eslint-enable prettier/prettier */
}

export enum InviteQueryScope {
    AS_INVITER = "AS_INVITER",
    AS_INVITEE = "AS_INVITEE",
}

export enum EntityType {
    /* eslint-disable prettier/prettier */
    PROJECT_ACCOUNT_ASSIGNMENT = "PROJECT_ACCOUNT_ASSIGNMENT",
    DEPT_ACCOUNT_ASSIGNMENT    = "DEPT_ACCOUNT_ASSIGNMENT",
    TEAM_ACCOUNT_ASSIGNMENT    = "TEAM_ACCOUNT_ASSIGNMENT",
    ORG_MEMBERSHIP             = "ORG_MEMBERSHIP",
    ORGANIZATION               = "ORGANIZATION",
    DEPARTMENT                 = "DEPARTMENT",
    PROJECT                    = "PROJECT",
    INVITE                     = "INVITE",
    TEAM                       = "TEAM",
    /* eslint-enable prettier/prettier */
}

export enum ActionType {
    /* eslint-disable prettier/prettier */
    INVALIDATE = "INVALIDATE",
    TRANSFER   = "TRANSFER",
    SUSPEND    = "SUSPEND",
    ARCHIVE    = "ARCHIVE",
    RESTORE    = "RESTORE",
    DECLINE    = "DECLINE",
    ACCEPT     = "ACCEPT",
    CANCEL     = "CANCEL",
    EXPIRE     = "EXPIRE",
    RESUME     = "RESUME",
    REVOKE     = "REVOKE",
    CREATE     = "CREATE",
    UPDATE     = "UPDATE",
    DELETE     = "DELETE",
    LEAVE      = "LEAVE",
    BLOCK      = "BLOCK",
    /* eslint-enable prettier/prettier */
}

export enum CleanupJob {
    /* eslint-disable prettier/prettier */
    CHANGE_LOG = "cleanup-change-log",
    AUDIT_LOG  = "cleanup-audit-log",
    INBOX      = "cleanup-inbox",
}

export enum OrganizationStatus {
    /* eslint-disable prettier/prettier */
    PROVISIONING = "PROVISIONING",
    FAILED       = "FAILED",
    ACTIVE       = "ACTIVE",
    REVOKED      = "REVOKED",
    /* eslint-enable prettier/prettier */
}

export enum ProjectStatus {
    /* eslint-disable prettier/prettier */
    PROVISIONING = "PROVISIONING",
    ARCHIVED     = "ARCHIVED",
    FAILED       = "FAILED",
    ACTIVE       = "ACTIVE",
    /* eslint-enable prettier/prettier */
}

export enum DepartmentStatus {
    /* eslint-disable prettier/prettier */
    ARCHIVED = "ARCHIVED",
    ACTIVE   = "ACTIVE",
    /* eslint-enable prettier/prettier */
}

export enum TeamStatus {
    /* eslint-disable prettier/prettier */
    ARCHIVED = "ARCHIVED",
    ACTIVE   = "ACTIVE",
    /* eslint-enable prettier/prettier */
}

export enum OrgMembershipStatus {
    /* eslint-disable prettier/prettier */
    SUSPENDED = "SUSPENDED",
    BLOCKED   = "BLOCKED",
    JOINING   = "JOINING",
    ACTIVE    = "ACTIVE",
    LEFT      = "LEFT",
    /* eslint-enable prettier/prettier */
}

export enum AssignmentStatus {
    /* eslint-disable prettier/prettier */
    REVOKED = "REVOKED",
    ACTIVE  = "ACTIVE",
    /* eslint-enable prettier/prettier */
}

export enum InviteStatus {
    /* eslint-disable prettier/prettier */
    INVALIDATED = "INVALIDATED",
    ACCEPTING   = "ACCEPTING",
    CANCELLED   = "CANCELLED",
    ACCEPTED    = "ACCEPTED",
    DECLINED    = "DECLINED",
    EXPIRED     = "EXPIRED",
    PENDING     = "PENDING",
    /* eslint-enable prettier/prettier */
}
