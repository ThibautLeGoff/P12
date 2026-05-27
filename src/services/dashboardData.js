import {
  USER_MAIN_DATA,
  USER_ACTIVITY,
  USER_AVERAGE_SESSIONS,
  USER_PERFORMANCE,
} from '../../data.js'
import {
  userService,
} from './userService.js'

// Indique si l'on doit utiliser l'API distante ou les données locales.
const USE_API = import.meta.env.VITE_USE_API === 'true'

// Utilisateur factice par défaut (aucune donnée associée).
const FALLBACK_USER = {
  id: 0,
  userInfos: {
    firstName: 'Prenom',
    lastName: 'Nom',
  },
  todayScore: 0.1,
  keyData: {},
}

// Construit un objet de tableau de bord à partir des données locales.
function getLocalData(userId) {
  const user = USER_MAIN_DATA?.find((entry) => entry.id === userId) ?? FALLBACK_USER
  const firstName = user?.userInfos?.firstName ?? FALLBACK_USER.userInfos.firstName
  const score = user?.todayScore ?? user?.score ?? 0
  const keyData = user?.keyData ?? {}

  const activitySessions =
    USER_ACTIVITY?.find((entry) => entry.userId === userId)?.sessions ?? []

  const averageSessions =
    USER_AVERAGE_SESSIONS?.find((entry) => entry.userId === userId)?.sessions ?? []

  const performance =
    USER_PERFORMANCE?.find((entry) => entry.userId === userId) ?? null

  return {
    userId,
    user,
    firstName,
    score,
    keyData,
    activitySessions,
    averageSessions,
    performance,
  }
}

export async function getDashboardData(userId) {
  // Si la variable d'environnement VITE_USE_API est false, on renvoie directement les données locales.
  if (!USE_API) {
    return getLocalData(userId)
  }

  // Sinon, on récupère toutes les ressources en parallèle.
  const [user, activitySessions, averageSessions, performance] = await Promise.all([
    userService.fetchUser(userId),
    userService.fetchUserActivity(userId),
    userService.fetchUserAverageSessions(userId),
    userService.fetchUserPerformance(userId),
  ])
  const resolvedUser = user ?? FALLBACK_USER
  const firstName = resolvedUser?.userInfos?.firstName ?? FALLBACK_USER.userInfos.firstName
  const score = resolvedUser?.todayScore ?? resolvedUser?.score ?? 0
  const keyData = resolvedUser?.keyData ?? {}

  return {
    userId,
    user,
    firstName,
    score,
    keyData,
    activitySessions,
    averageSessions,
    performance,
  }
}
