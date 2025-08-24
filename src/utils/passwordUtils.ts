// Utilitaires pour la gestion des mots de passe

/**
 * Génère un mot de passe par défaut basé sur le nom de l'entreprise et l'email
 * @param companyName Nom de l'entreprise
 * @param email Email de l'utilisateur
 * @returns Mot de passe par défaut
 */
export const generateDefaultPassword = (companyName: string, email: string): string => {
  // Extraire le nom de domaine de l'email
  const domain = email.split('@')[1]?.split('.')[0] || 'company';
  
  // Créer un mot de passe par défaut : CompanyName123!
  const cleanCompanyName = companyName
    .replace(/[^a-zA-Z]/g, '') // Garder seulement les lettres
    .substring(0, 8); // Limiter à 8 caractères
  
  return `${cleanCompanyName}123!`;
};

/**
 * Génère un mot de passe par défaut pour un utilisateur spécifique
 * @param user Objet utilisateur
 * @param tenant Objet tenant
 * @returns Mot de passe par défaut
 */
export const generateUserDefaultPassword = (user: { firstName: string; lastName: string }, tenant: { companyName: string }): string => {
  const cleanCompanyName = tenant.companyName
    .replace(/[^a-zA-Z]/g, '')
    .substring(0, 6);
  
  const cleanFirstName = user.firstName
    .replace(/[^a-zA-Z]/g, '')
    .substring(0, 3);
  
  return `${cleanCompanyName}${cleanFirstName}123!`;
};

/**
 * Vérifie si un mot de passe respecte les critères de sécurité
 * @param password Mot de passe à vérifier
 * @returns true si le mot de passe est valide
 */
export const validatePassword = (password: string): boolean => {
  // Au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

/**
 * Génère un mot de passe aléatoire sécurisé
 * @param length Longueur du mot de passe (défaut: 12)
 * @returns Mot de passe aléatoire
 */
export const generateSecurePassword = (length: number = 12): string => {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@$!%*?&';
  let password = '';
  
  // Assurer au moins un caractère de chaque type
  password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)]; // Majuscule
  password += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)]; // Minuscule
  password += '0123456789'[Math.floor(Math.random() * 10)]; // Chiffre
  password += '@$!%*?&'[Math.floor(Math.random() * 7)]; // Caractère spécial
  
  // Remplir le reste avec des caractères aléatoires
  for (let i = 4; i < length; i++) {
    password += charset[Math.floor(Math.random() * charset.length)];
  }
  
  // Mélanger les caractères
  return password.split('').sort(() => Math.random() - 0.5).join('');
};
