export type RoleTranslator = (key: string) => string

export function translateRole(role: string | undefined, t: RoleTranslator): string {
  if (!role) return '—'

  const normalized = role.toLowerCase()
  switch (normalized) {
    case 'admin':
      return t('profile.roleAdmin')
    case 'manager':
      return t('profile.roleManager')
    case 'operator':
      return t('profile.roleOperator')
    case 'engineer':
      return t('profile.roleEngineer')
    case 'maintenance':
      return t('profile.roleMaintenance')
    case 'complianceofficer':
      return t('profile.roleComplianceOfficer')
    default:
      return role
  }
}
