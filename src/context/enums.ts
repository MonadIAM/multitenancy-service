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
    EXAMPLE                    = "EXAMPLE",
    /* eslint-enable prettier/prettier */
}

export enum ActionType {
    CREATE = "CREATE",
    UPDATE = "UPDATE",
    DELETE = "DELETE",
}

export enum CleanupJob {
    /* eslint-disable prettier/prettier */
    CHANGE_LOG = "cleanup-change-log",
    AUDIT_LOG  = "cleanup-audit-log",
    INBOX      = "cleanup-inbox",
    /* eslint-enable prettier/prettier */
}

export enum OrganizationStatus {
    ACTIVE = "ACTIVE",
    REVOKED = "REVOKED",
}

export enum ProjectStatus {
    ACTIVE = "ACTIVE",
    ARCHIVED = "ARCHIVED",
}

export enum DepartmentStatus {
    ACTIVE = "ACTIVE",
    ARCHIVED = "ARCHIVED",
}

export enum TeamStatus {
    ACTIVE = "ACTIVE",
    ARCHIVED = "ARCHIVED",
}

export enum OrgMembershipStatus {
    /* eslint-disable prettier/prettier */
    SUSPENDED = "SUSPENDED",
    BLOCKED   = "BLOCKED",
    ACTIVE    = "ACTIVE",
    LEFT      = "LEFT",
    /* eslint-enable prettier/prettier */
}

export enum AssignmentStatus {
    ACTIVE = "ACTIVE",
    REVOKED = "REVOKED",
}

export enum InviteStatus {
    /* eslint-disable prettier/prettier */
    INVALIDATED = "INVALIDATED",
    CANCELLED   = "CANCELLED",
    ACCEPTED    = "ACCEPTED",
    DECLINED    = "DECLINED",
    EXPIRED     = "EXPIRED",
    PENDING     = "PENDING",
    /* eslint-enable prettier/prettier */
}
