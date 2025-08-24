/**
 * Fonction utilitaire pour formater les dates de manière sécurisée
 * @param date - La date à formater (peut être Date, string ou undefined)
 * @param options - Options de formatage (optionnel)
 * @returns La date formatée ou 'N/A' si invalide
 */
export const formatDateSafely = (
  date: Date | string | undefined,
  options?: Intl.DateTimeFormatOptions
): string => {
  if (!date) return 'N/A';
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    // Vérifier si la date est valide
    if (isNaN(dateObj.getTime())) {
      return 'Date invalide';
    }
    
    // Utiliser les options par défaut si aucune n'est fournie
    const defaultOptions: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      ...options
    };
    
    return dateObj.toLocaleDateString('en-US', defaultOptions);
  } catch (error) {
    console.error('Erreur de formatage de date:', error);
    return 'Erreur de date';
  }
};

/**
 * Fonction utilitaire pour formater les dates courtes
 * @param date - La date à formater
 * @returns La date formatée en format court
 */
export const formatDateShort = (date: Date | string | undefined): string => {
  return formatDateSafely(date, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
};

/**
 * Fonction utilitaire pour vérifier si une date est valide
 * @param date - La date à vérifier
 * @returns true si la date est valide, false sinon
 */
export const isValidDate = (date: Date | string | undefined): boolean => {
  if (!date) return false;
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return !isNaN(dateObj.getTime());
  } catch (error) {
    return false;
  }
}; 