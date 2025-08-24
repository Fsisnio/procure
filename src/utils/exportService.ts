// @ts-ignore
import jsPDF from 'jspdf';
import { saveAs } from 'file-saver';

export interface ExportOptions {
  format: string;
  template: string;
  includeLogo: boolean;
  includeSignature: boolean;
  includeTerms: boolean;
  customHeader: string;
  customFooter: string;
  colorScheme: string;
  fontSize: string;
  tvaRate: number; // Taux de TVA personnalisable
}

export interface OrderData {
  orderNumber: string;
  orderDate: string;
  expectedDeliveryDate: string;
  supplier: any;
  items: any[];
  notes: string;
  total: number;
  tvaRate: number; // Taux de TVA personnalisable
  tenant?: {
    id: string;
    name: string;
    domain?: string;
    address?: string;
    city?: string;
    country?: string;
    postalCode?: string;
    phone?: string;
    email?: string;
  };
}

class ExportService {
  private getColorScheme(colors: string) {
    const schemes = {
      blue: {
        primary: [25, 118, 210],
        secondary: [197, 202, 233],
        accent: [3, 169, 244],
      },
      green: {
        primary: [46, 125, 50],
        secondary: [200, 230, 201],
        accent: [76, 175, 80],
      },
      purple: {
        primary: [123, 31, 162],
        secondary: [225, 190, 231],
        accent: [156, 39, 176],
      },
      orange: {
        primary: [245, 124, 0],
        secondary: [255, 224, 178],
        accent: [255, 152, 0],
      },
      gray: {
        primary: [66, 66, 66],
        secondary: [224, 224, 224],
        accent: [117, 117, 117],
      },
    };
    return schemes[colors as keyof typeof schemes] || schemes.blue;
  }

  private getFontSize(size: string) {
    const sizes = {
      small: { title: 18, subtitle: 12, body: 8, small: 6 },
      medium: { title: 22, subtitle: 14, body: 10, small: 8 },
      large: { title: 26, subtitle: 16, body: 12, small: 10 },
    };
    return sizes[size as keyof typeof sizes] || sizes.medium;
  }

  private getTemplateStyle(template: string) {
    const templates = {
      professional: {
        headerHeight: 45,
        useGradient: true,
        borderStyle: 'rounded',
        spacing: 'comfortable',
      },
      classic: {
        headerHeight: 35,
        useGradient: false,
        borderStyle: 'straight',
        spacing: 'compact',
      },
      minimal: {
        headerHeight: 30,
        useGradient: false,
        borderStyle: 'none',
        spacing: 'minimal',
      },
      corporate: {
        headerHeight: 50,
        useGradient: true,
        borderStyle: 'rounded',
        spacing: 'generous',
      },
    };
    return templates[template as keyof typeof templates] || templates.professional;
  }

  async exportToPDF(orderData: OrderData, options: ExportOptions): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new jsPDF('portrait');
        const colors = this.getColorScheme(options.colorScheme);
        const fonts = this.getFontSize(options.fontSize);
        
        const pageWidth = 210;
        const pageHeight = 297;
        const margin = 20;
        const contentWidth = pageWidth - (2 * margin);

        // En-tête principal
        this.drawHeader(doc, orderData, options, colors, fonts, pageWidth, margin);
        
        // Informations de l'entreprise et fournisseur
        let currentY = this.drawCompanyInfo(doc, orderData, options, colors, fonts, margin, contentWidth);
        
        // Informations de commande
        currentY = this.drawOrderInfo(doc, orderData, options, colors, fonts, margin, contentWidth, currentY);
        
        // Tableau des produits
        currentY = this.drawProductsTable(doc, orderData, options, colors, fonts, margin, contentWidth, currentY);
        
        // Totaux
        currentY = this.drawTotals(doc, orderData, options, colors, fonts, margin, contentWidth, currentY);
        
        // Conditions et notes
        currentY = this.drawFooterInfo(doc, orderData, options, colors, fonts, margin, contentWidth, currentY);
        
        // Pied de page supprimé
        
        // Sauvegarde
        const fileName = `bon_commande_${orderData.orderNumber}_${new Date().toISOString().split('T')[0]}.pdf`;
        doc.save(fileName);
        
        // Enregistrer l'historique
        this.saveExportHistory(orderData, options, 'pdf');
        
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }

  async exportToExcel(orderData: OrderData, options: ExportOptions): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        // Créer le contenu Excel
        const excelContent = this.generateExcelContent(orderData, options);
        
        // Créer le fichier Excel (format CSV pour simplifier)
        const csvContent = this.convertToCSV(excelContent);
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        
        const fileName = `bon_commande_${orderData.orderNumber}_${new Date().toISOString().split('T')[0]}.csv`;
        saveAs(blob, fileName);
        
        // Enregistrer l'historique
        this.saveExportHistory(orderData, options, 'excel');
        
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }

  async exportToWord(orderData: OrderData, options: ExportOptions): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        // Créer le contenu Word (format HTML pour simplifier)
        const wordContent = this.generateWordContent(orderData, options);
        
        const blob = new Blob([wordContent], { type: 'application/msword' });
        const fileName = `bon_commande_${orderData.orderNumber}_${new Date().toISOString().split('T')[0]}.doc`;
        saveAs(blob, fileName);
        
        // Enregistrer l'historique
        this.saveExportHistory(orderData, options, 'word');
        
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }

  private drawHeader(doc: any, orderData: OrderData, options: ExportOptions, colors: any, fonts: any, pageWidth: number, margin: number) {
    const templateStyle = this.getTemplateStyle(options.template);
    
    // Bannière principale selon le template
    doc.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2]);
    doc.rect(0, 0, pageWidth, templateStyle.headerHeight, 'F');
    
    // Logo si activé
    if (options.includeLogo) {
      doc.setFillColor(255, 255, 255);
      if (templateStyle.borderStyle === 'rounded') {
        doc.circle(25, templateStyle.headerHeight / 2, 8, 'F');
      } else {
        doc.rect(17, templateStyle.headerHeight / 2 - 8, 16, 16, 'F');
      }
      doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
      doc.setFontSize(fonts.title);
      doc.setFont('helvetica', 'bold');
      doc.text('P', 25, templateStyle.headerHeight / 2 + 4, { align: 'center' });
    }
    
    // En-tête personnalisé si fourni
    if (options.customHeader) {
      doc.setFontSize(fonts.small);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(255, 255, 255);
      doc.text(options.customHeader, pageWidth / 2, 15, { align: 'center' });
    }
    
    // Titre principal
    doc.setFontSize(fonts.title);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text('BON DE COMMANDE', pageWidth / 2, templateStyle.headerHeight / 2 - 5, { align: 'center' });
    
    // Sous-titre - ProcureX
    doc.setFontSize(fonts.subtitle);
    doc.setFont('helvetica', 'normal');
    doc.text('ProcureX', pageWidth / 2, templateStyle.headerHeight / 2 + 5, { align: 'center' });
    
    // Nom de l'entreprise (tenant) si disponible
    if (orderData.tenant?.name) {
      doc.setFontSize(fonts.body);
      doc.setFont('helvetica', 'bold');
      doc.text(orderData.tenant.name, pageWidth / 2, templateStyle.headerHeight / 2 + 15, { align: 'center' });
    }
    
    // Date de génération
    doc.setFontSize(fonts.small);
    const now = new Date();
    const dateStr = now.toLocaleDateString('fr-FR');
    const timeStr = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    doc.text(`Généré le: ${dateStr} à ${timeStr}`, pageWidth - margin, 15, { align: 'right' });
  }

  private drawCompanyInfo(doc: any, orderData: OrderData, options: ExportOptions, colors: any, fonts: any, margin: number, contentWidth: number): number {
    let y = 60;
    
    // Section gauche - Informations de l'entreprise connectée (tenant)
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(fonts.subtitle);
    doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
    
    // Nom de l'entreprise (tenant)
    const companyName = orderData.tenant?.name || 'ProcureX SARL';
    doc.text(companyName, margin, y);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(fonts.body);
    doc.setTextColor(51, 51, 51);
    
    // Description de l'entreprise
    doc.text('Société de gestion des fournisseurs', margin, y + 8);
    
    // Adresse complète de l'entreprise (si disponible)
    let addressLine = '';
    if (orderData.tenant?.address) {
      addressLine = orderData.tenant.address;
      if (orderData.tenant.city) {
        addressLine += `, ${orderData.tenant.city}`;
      }
      if (orderData.tenant.postalCode) {
        addressLine += `, ${orderData.tenant.postalCode}`;
      }
      if (orderData.tenant.country) {
        addressLine += `, ${orderData.tenant.country}`;
      }
    } else {
      addressLine = '123 Avenue ProcureX, 75001 Paris';
    }
    doc.text(addressLine, margin, y + 16);
    
    // Téléphone de l'entreprise (si disponible)
    const phone = orderData.tenant?.phone || '+33 1 23 45 67 89';
    doc.text(`Tél: ${phone}`, margin, y + 24);
    
    // Email de l'entreprise (si disponible)
    const email = orderData.tenant?.email || 'contact@procurex-sarl.fr';
    doc.text(`Email: ${email}`, margin, y + 32);
    
    // Section droite - FOURNISSEUR
    if (orderData.supplier) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(fonts.subtitle);
      doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
      doc.text('FOURNISSEUR', margin + contentWidth / 2, y);
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(fonts.body);
      doc.setTextColor(51, 51, 51);
      doc.text(orderData.supplier.name || 'Nom non défini', margin + contentWidth / 2, y + 8);
      doc.text(orderData.supplier.address || 'Adresse non définie', margin + contentWidth / 2, y + 16);
      doc.text(orderData.supplier.email || 'Email non défini', margin + contentWidth / 2, y + 24);
      doc.text(orderData.supplier.phone || 'Téléphone non défini', margin + contentWidth / 2, y + 32);
    }
    
    return y + 40;
  }

  private drawOrderInfo(doc: any, orderData: OrderData, options: ExportOptions, colors: any, fonts: any, margin: number, contentWidth: number, startY: number): number {
    let y = startY;
    
    // Encadré pour les informations de commande
    doc.setDrawColor(200, 200, 200);
    doc.setFillColor(248, 249, 250);
    doc.rect(margin, y - 5, contentWidth, 35, 'F');
    doc.rect(margin, y - 5, contentWidth, 35, 'S');
    
    // Date et numéro de commande
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(fonts.body);
    doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
    doc.text('Date de commande:', margin + 5, y);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(51, 51, 51);
    doc.text(orderData.orderDate, margin + 55, y);
    
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
    doc.text('N° Bon de commande:', margin + 5, y + 12);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(51, 51, 51);
    doc.text(orderData.orderNumber, margin + 55, y + 12);
    
    return y + 35;
  }

  private drawProductsTable(doc: any, orderData: OrderData, options: ExportOptions, colors: any, fonts: any, margin: number, contentWidth: number, startY: number): number {
    let y = startY;
    
    // En-tête du tableau
    doc.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2]);
    doc.rect(margin, y, contentWidth, 18, 'F');
    
    const colWidths = [25, 60, 25, 30, 30];
    const colHeaders = ['Qté', 'Description', 'Prix U.', 'Total HT', 'TVA'];
    let currentX = margin;
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(fonts.small);
    doc.setTextColor(255, 255, 255);
    
    colHeaders.forEach((header, index) => {
      doc.text(header, currentX + colWidths[index] / 2, y + 12, { align: 'center' });
      currentX += colWidths[index];
    });
    
    y += 18;
    
    // Lignes de produits
    orderData.items.forEach((item, index) => {
      // Alternance de couleurs
      if (index % 2 === 0) {
        doc.setFillColor(248, 249, 250);
      } else {
        doc.setFillColor(255, 255, 255);
      }
      
      doc.rect(margin, y, contentWidth, 18, 'F');
      doc.setDrawColor(200, 200, 200);
      doc.rect(margin, y, contentWidth, 18, 'S');
      
      const colWidths = [25, 60, 25, 30, 30];
      let currentX = margin;
      
      doc.setFontSize(fonts.small);
      doc.setTextColor(51, 51, 51);
      
      // Quantité
      doc.text(item.quantity.toString(), currentX + colWidths[0] / 2, y + 12, { align: 'center' });
      currentX += colWidths[0];
      
      // Description
      doc.text(item.productName, currentX + 2, y + 12);
      currentX += colWidths[1];
      
      // Prix unitaire
      doc.text(`${item.unitPrice.toFixed(2)}`, currentX + colWidths[2] / 2, y + 12, { align: 'center' });
      currentX += colWidths[2];
      
      // Total HT
      doc.text(`${item.totalPrice.toFixed(2)}`, currentX + colWidths[3] / 2, y + 12, { align: 'center' });
      currentX += colWidths[3];
      
      // TVA
      doc.text(`${orderData.tvaRate}%`, currentX + colWidths[4] / 2, y + 12, { align: 'center' });
      
      y += 18;
    });
    
    return y;
  }

  private drawTotals(doc: any, orderData: OrderData, options: ExportOptions, colors: any, fonts: any, margin: number, contentWidth: number, startY: number): number {
    let y = startY;
    
    const totalHT = orderData.total;
    const totalTVA = totalHT * (orderData.tvaRate / 100);
    const totalTTC = totalHT + totalTVA;
    
    // Encadré pour le total
    const totalBoxWidth = 90;
    const totalBoxHeight = 35;
    const totalBoxX = margin + contentWidth - totalBoxWidth;
    
    doc.setDrawColor(colors.primary[0], colors.primary[1], colors.primary[2]);
    doc.setFillColor(248, 249, 250);
    doc.rect(totalBoxX, y, totalBoxWidth, totalBoxHeight, 'F');
    doc.rect(totalBoxX, y, totalBoxWidth, totalBoxHeight, 'S');
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(fonts.body);
    doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
    
    doc.text('TOTAL HT:', totalBoxX + 5, y + 10);
    doc.text(`TVA ${orderData.tvaRate}%:`, totalBoxX + 5, y + 20);
    
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(51, 51, 51);
    doc.text(`${totalHT.toFixed(2)}`, totalBoxX + totalBoxWidth - 5, y + 10, { align: 'right' });
    doc.text(`${totalTVA.toFixed(2)}`, totalBoxX + totalBoxWidth - 5, y + 20, { align: 'right' });
    
    // Total TTC en évidence
    doc.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2]);
    doc.rect(totalBoxX, y + 25, totalBoxWidth, 10, 'F');
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(fonts.subtitle);
    doc.setTextColor(255, 255, 255);
    doc.text('TOTAL TTC:', totalBoxX + 5, y + 32);
    doc.text(`${totalTTC.toFixed(2)}`, totalBoxX + totalBoxWidth - 5, y + 32, { align: 'right' });
    
    return y + totalBoxHeight + 10;
  }

  private drawFooterInfo(doc: any, orderData: OrderData, options: ExportOptions, colors: any, fonts: any, margin: number, contentWidth: number, startY: number): number {
    let y = startY;
    
    // Conditions de règlement
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(fonts.body);
    doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
    doc.text('CONDITIONS DE RÈGLEMENT:', margin, y);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(fonts.small);
    doc.setTextColor(51, 51, 51);
    doc.text('30 jours net après réception de la facture', margin, y + 8);
    doc.text('Paiement par virement bancaire ou chèque', margin, y + 16);
    
    // Conditions générales si activées
    if (options.includeTerms) {
      y += 30;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(fonts.body);
      doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
      doc.text('CONDITIONS GÉNÉRALES:', margin, y);
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(fonts.small);
      doc.setTextColor(51, 51, 51);
      
      const terms = [
        '• Les prix sont fermes et valables 30 jours à compter de la date de commande',
        '• La livraison s\'effectue à l\'adresse indiquée dans un délai de 7 jours ouvrés',
        '• Tout retard de livraison sera signalé au plus tard 48h avant la date prévue',
        '• Les produits sont garantis conformes aux spécifications techniques',
        '• En cas de litige, les tribunaux du ressort du siège social sont seuls compétents'
      ];
      
      terms.forEach((term, index) => {
        doc.text(term, margin, y + 8 + (index * 6));
      });
      y += 8 + (terms.length * 6);
    }
    
    // Notes si présentes
    if (orderData.notes) {
      y += 20;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(fonts.body);
      doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
      doc.text('NOTES ET OBSERVATIONS:', margin, y);
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(fonts.small);
      doc.setTextColor(51, 51, 51);
      const notesLines = doc.splitTextToSize(orderData.notes, contentWidth - 10);
      notesLines.forEach((line: string, index: number) => {
        doc.text(line, margin, y + 8 + (index * 6));
      });
      y += 8 + (notesLines.length * 6);
    }
    
    // Espace signature si activé
    if (options.includeSignature) {
      y += 30;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(fonts.body);
      doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
      doc.text('SIGNATURES:', margin, y);
      
      // Encadré pour la signature
      const signatureBoxWidth = 80;
      const signatureBoxHeight = 40;
      const signatureBoxX = margin + contentWidth - signatureBoxWidth;
      
      doc.setDrawColor(200, 200, 200);
      doc.setFillColor(248, 249, 250);
      doc.rect(signatureBoxX, y + 10, signatureBoxWidth, signatureBoxHeight, 'F');
      doc.rect(signatureBoxX, y + 10, signatureBoxWidth, signatureBoxHeight, 'S');
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(fonts.small);
      doc.setTextColor(102, 102, 102);
      doc.text('Signature du fournisseur', signatureBoxX + signatureBoxWidth / 2, y + 25, { align: 'center' });
      doc.text('Date:', signatureBoxX + signatureBoxWidth / 2, y + 45, { align: 'center' });
      
      // Encadré pour la signature client
      const clientSignatureBoxX = margin;
      doc.rect(clientSignatureBoxX, y + 10, signatureBoxWidth, signatureBoxHeight, 'F');
      doc.rect(clientSignatureBoxX, y + 10, signatureBoxWidth, signatureBoxHeight, 'S');
      
      doc.text('Signature du client', clientSignatureBoxX + signatureBoxWidth / 2, y + 25, { align: 'center' });
      doc.text('Date:', clientSignatureBoxX + signatureBoxWidth / 2, y + 45, { align: 'center' });
      
      y += signatureBoxHeight + 20;
    }
    
    return y + 20;
  }

  private drawPageFooter(doc: any, pageWidth: number, pageHeight: number, margin: number, contentWidth: number, colors: any, options: ExportOptions, orderData?: OrderData) {
    const footerY = pageHeight - 25; // Plus d'espace pour le footer
    
    // Ligne de séparation
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, footerY - 5, margin + contentWidth, footerY - 5);
    
    // Pied de page personnalisé si fourni
    if (options.customFooter) {
      doc.setTextColor(102, 102, 102);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text(options.customFooter, pageWidth / 2, footerY - 2, { align: 'center' });
    }
    
    // Configuration des couleurs et tailles de police
    doc.setTextColor(102, 102, 102);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    
    // Première ligne : Nom de l'entreprise centré
    const companyLine = orderData?.tenant?.name 
      ? `ProcureX - ${orderData.tenant.name}`
      : 'ProcureX';
    
    doc.text(companyLine, pageWidth / 2, footerY, { align: 'center' });
    
    // Deuxième ligne : Type de document centré
    doc.text('Bon de Commande Professionnel', pageWidth / 2, footerY + 5, { align: 'center' });
    
    // Troisième ligne : Informations de contact centrées
    doc.text('www.procurex-sarl.fr | contact@procurex-sarl.fr', pageWidth / 2, footerY + 10, { align: 'center' });
  }

  private generateExcelContent(orderData: OrderData, options: ExportOptions): any[][] {
    const content = [
      ['BON DE COMMANDE - ProcureX SARL'],
      [''],
      ['Informations de commande'],
      ['Numéro de commande', orderData.orderNumber],
      ['Date de commande', orderData.orderDate],
      ['Date de livraison prévue', orderData.expectedDeliveryDate],
      [''],
      ['Informations fournisseur'],
      ['Nom', orderData.supplier?.name || ''],
      ['Adresse', orderData.supplier?.address || ''],
      ['Email', orderData.supplier?.email || ''],
      ['Téléphone', orderData.supplier?.phone || ''],
      [''],
      ['Produits commandés'],
      ['Quantité', 'Description', 'Prix unitaire', 'Total HT', 'TVA', 'Total TTC'],
    ];
    
    orderData.items.forEach(item => {
      const totalTTC = item.totalPrice * (1 + orderData.tvaRate / 100);
      content.push([
        item.quantity.toString(),
        item.productName,
        item.unitPrice.toFixed(2),
        item.totalPrice.toFixed(2),
        `${orderData.tvaRate}%`,
        totalTTC.toFixed(2)
      ]);
    });
    
    const totalHT = orderData.total;
    const totalTVA = totalHT * (orderData.tvaRate / 100);
    const totalTTC = totalHT + totalTVA;
    
    content.push(['']);
    content.push(['', '', '', 'TOTAL HT', totalHT.toFixed(2)]);
    content.push(['', '', '', `TVA ${orderData.tvaRate}%`, totalTVA.toFixed(2)]);
    content.push(['', '', '', 'TOTAL TTC', totalTTC.toFixed(2)]);
    
    if (orderData.notes) {
      content.push(['']);
      content.push(['Notes et observations']);
      content.push([orderData.notes]);
    }
    
    return content;
  }

  private convertToCSV(content: any[][]): string {
    return content.map(row => 
      row.map(cell => 
        typeof cell === 'string' && cell.includes(',') ? `"${cell}"` : cell
      ).join(',')
    ).join('\n');
  }

  private generateWordContent(orderData: OrderData, options: ExportOptions): string {
    const totalHT = orderData.total;
    const totalTVA = totalHT * (orderData.tvaRate / 100);
    const totalTTC = totalHT + totalTVA;
    
    return `
      <html>
        <head>
          <meta charset="utf-8">
          <title>Bon de Commande - ${orderData.orderNumber}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; }
            .header { background-color: #1976d2; color: white; padding: 20px; text-align: center; }
            .section { margin: 20px 0; }
            .table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            .table th, .table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            .table th { background-color: #1976d2; color: white; }
            .total { background-color: #f5f5f5; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>BON DE COMMANDE</h1>
            <p>ProcureX</p>
          </div>
          
          <div class="section">
            <h2>Informations de commande</h2>
            <p><strong>Numéro:</strong> ${orderData.orderNumber}</p>
            <p><strong>Date:</strong> ${orderData.orderDate}</p>
            <p><strong>Livraison prévue:</strong> ${orderData.expectedDeliveryDate}</p>
          </div>
          
          <div class="section">
            <h2>Fournisseur</h2>
            <p><strong>Nom:</strong> ${orderData.supplier?.name || ''}</p>
            <p><strong>Adresse:</strong> ${orderData.supplier?.address || ''}</p>
            <p><strong>Email:</strong> ${orderData.supplier?.email || ''}</p>
          </div>
          
          <div class="section">
            <h2>Produits commandés</h2>
            <table class="table">
              <thead>
                <tr>
                  <th>Quantité</th>
                  <th>Description</th>
                  <th>Prix unitaire</th>
                  <th>Total HT</th>
                  <th>TVA</th>
                  <th>Total TTC</th>
                </tr>
              </thead>
              <tbody>
                ${orderData.items.map(item => `
                  <tr>
                    <td>${item.quantity}</td>
                    <td>${item.productName}</td>
                    <td>${item.unitPrice.toFixed(2)}</td>
                    <td>${item.totalPrice.toFixed(2)}</td>
                    <td>${orderData.tvaRate}%</td>
                    <td>${(item.totalPrice * (1 + orderData.tvaRate / 100)).toFixed(2)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
          
          <div class="section">
            <table class="table">
              <tr class="total">
                <td colspan="3">TOTAL HT</td>
                <td>${totalHT.toFixed(2)}</td>
                <td></td>
                <td></td>
              </tr>
              <tr class="total">
                <td colspan="3">TVA ${orderData.tvaRate}%</td>
                <td>${totalTVA.toFixed(2)}</td>
                <td></td>
                <td></td>
              </tr>
              <tr class="total">
                <td colspan="3">TOTAL TTC</td>
                <td>${totalTTC.toFixed(2)}</td>
                <td></td>
                <td></td>
              </tr>
            </table>
          </div>
          
          ${orderData.notes ? `
            <div class="section">
              <h2>Notes et observations</h2>
              <p>${orderData.notes}</p>
            </div>
          ` : ''}
        </body>
      </html>
    `;
  }

  private saveExportHistory(orderData: OrderData, options: ExportOptions, format: string) {
    const history = JSON.parse(localStorage.getItem('exportHistory') || '[]');
    const exportRecord = {
      id: Date.now(),
      orderNumber: orderData.orderNumber,
      format,
      options,
      timestamp: new Date().toISOString(),
      total: orderData.total,
      itemCount: orderData.items.length,
    };
    
    history.unshift(exportRecord);
    
    // Garder seulement les 50 derniers exports
    if (history.length > 50) {
      history.splice(50);
    }
    
    localStorage.setItem('exportHistory', JSON.stringify(history));
  }

  async exportOrder(orderData: OrderData, options: ExportOptions): Promise<void> {
    switch (options.format) {
      case 'pdf':
        return this.exportToPDF(orderData, options);
      case 'excel':
        return this.exportToExcel(orderData, options);
      case 'word':
        return this.exportToWord(orderData, options);
      default:
        throw new Error(`Format d'export non supporté: ${options.format}`);
    }
  }
}

export default new ExportService();
