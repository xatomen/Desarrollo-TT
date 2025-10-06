// utils/pdfGenerator.ts
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export interface PDFGeneratorOptions {
  title: string;
  subtitle?: string;
  filename?: string;
  headerColor?: string;
  includeTimestamp?: boolean;
}

export class PDFGenerator {
  private pdf: jsPDF;
  private pageWidth: number;
  private pageHeight: number;
  private margin: number = 20;
  private currentY: number = 20;

  constructor() {
    this.pdf = new jsPDF('p', 'mm', 'a4');
    this.pageWidth = this.pdf.internal.pageSize.getWidth();
    this.pageHeight = this.pdf.internal.pageSize.getHeight();
  }

  // Método principal para generar PDF desde un elemento HTML
  async generateFromElement(
    elementId: string, 
    options: PDFGeneratorOptions
  ): Promise<void> {
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error(`Elemento con ID '${elementId}' no encontrado`);
    }

    // Aplicar clase para PDF
    element.classList.add('generating-pdf');

    try {
      // Esperar a que se apliquen los estilos CSS
      await new Promise(resolve => setTimeout(resolve, 500));

      // Configurar el canvas para mejor calidad
      const canvas = await html2canvas(element, {
        scale: 1.5,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        width: element.scrollWidth,
        height: element.scrollHeight,
        windowWidth: 1200,
        windowHeight: element.scrollHeight,
        scrollX: 0,
        scrollY: 0,
        onclone: (clonedDoc) => {
          const clonedElement = clonedDoc.getElementById(elementId);
          if (clonedElement) {
            // Aplicar estilos específicos para PDF en el clon
            clonedElement.classList.add('generating-pdf');
            
            // Optimizar tablas
            const tables = clonedElement.querySelectorAll('table');
            tables.forEach(table => {
              const htmlTable = table as HTMLElement;
              htmlTable.style.tableLayout = 'fixed';
              htmlTable.style.width = '100%';
              htmlTable.style.fontSize = '11px';
              htmlTable.style.lineHeight = '1.2';
            });

            // Optimizar canvas y gráficos
            const canvases = clonedElement.querySelectorAll('canvas');
            canvases.forEach(canvas => {
              const htmlCanvas = canvas as HTMLElement;
              htmlCanvas.style.maxWidth = '100%';
              htmlCanvas.style.height = 'auto';
            });

            // Optimizar cards
            const cards = clonedElement.querySelectorAll('.card');
            cards.forEach(card => {
              const htmlCard = card as HTMLElement;
              htmlCard.style.breakInside = 'avoid';
              htmlCard.style.marginBottom = '15px';
            });
          }
        }
      });

      const imgData = canvas.toDataURL('image/png', 1.0);
      const imgWidth = this.pageWidth - (this.margin * 2);
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      // Añadir header personalizado
      this.addHeader(options.title, options.subtitle, options.headerColor);

      // Calcular posición inicial después del header
      let yPosition = this.currentY + 10;

      // Si la imagen es muy alta, dividirla en páginas
      const maxHeightPerPage = this.pageHeight - yPosition - this.margin - 20; // Espacio para footer
      
      if (imgHeight <= maxHeightPerPage) {
        // La imagen cabe en una página
        this.pdf.addImage(imgData, 'PNG', this.margin, yPosition, imgWidth, imgHeight);
      } else {
        // Dividir en múltiples páginas
        let remainingHeight = imgHeight;
        let sourceY = 0;
        let pageNumber = 1;
        
        while (remainingHeight > 0) {
          const currentPageHeight = Math.min(remainingHeight, maxHeightPerPage);
          const sourceHeight = (currentPageHeight * canvas.height) / imgHeight;
          
          // Crear canvas para esta porción
          const pageCanvas = document.createElement('canvas');
          pageCanvas.width = canvas.width;
          pageCanvas.height = sourceHeight;
          
          const pageCtx = pageCanvas.getContext('2d');
          if (pageCtx) {
            pageCtx.drawImage(
              canvas, 
              0, sourceY, canvas.width, sourceHeight,
              0, 0, canvas.width, sourceHeight
            );
            
            const pageImgData = pageCanvas.toDataURL('image/png', 1.0);
            this.pdf.addImage(pageImgData, 'PNG', this.margin, yPosition, imgWidth, currentPageHeight);
          }
          
          remainingHeight -= currentPageHeight;
          sourceY += sourceHeight;
          
          if (remainingHeight > 0) {
            this.pdf.addPage();
            this.addHeader(options.title, options.subtitle, options.headerColor);
            yPosition = this.currentY + 10;
            pageNumber++;
          }
        }
      }

      // Añadir footer con timestamp si se solicita
      if (options.includeTimestamp) {
        this.addFooter();
      }

      // Descargar el PDF
      const filename = options.filename || `${options.title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
      this.pdf.save(filename);

    } catch (error) {
      console.error('Error generando PDF:', error);
      throw new Error('Error al generar el PDF. Por favor, inténtalo de nuevo.');
    } finally {
      // Quitar clase de PDF
      element.classList.remove('generating-pdf');
    }
  }

  private addHeader(title: string, subtitle?: string, headerColor: string = '#2563eb'): void {
    // Fondo del header
    this.pdf.setFillColor(headerColor);
    this.pdf.rect(0, 0, this.pageWidth, 40, 'F');

    // Título principal
    this.pdf.setTextColor('#ffffff');
    this.pdf.setFontSize(18);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text(title, this.margin, 25);

    // Subtítulo si existe
    if (subtitle) {
      this.pdf.setFontSize(12);
      this.pdf.setFont('helvetica', 'normal');
      this.pdf.text(subtitle, this.margin, 35);
    }

    // Línea separadora
    this.pdf.setDrawColor('#e5e7eb');
    this.pdf.setLineWidth(0.5);
    this.pdf.line(this.margin, 42, this.pageWidth - this.margin, 42);

    this.currentY = 45;
  }

  private addFooter(): void {
    const pageCount = this.pdf.internal.getNumberOfPages();
    
    for (let i = 1; i <= pageCount; i++) {
      this.pdf.setPage(i);
      
      // Línea separadora del footer
      this.pdf.setDrawColor('#e5e7eb');
      this.pdf.setLineWidth(0.5);
      this.pdf.line(this.margin, this.pageHeight - 20, this.pageWidth - this.margin, this.pageHeight - 20);
      
      // Información del footer
      this.pdf.setTextColor('#6b7280');
      this.pdf.setFontSize(8);
      this.pdf.setFont('helvetica', 'normal');
      
      // Fecha y hora de generación (izquierda)
      const timestamp = new Date().toLocaleString('es-CL', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
      this.pdf.text(`Generado: ${timestamp}`, this.margin, this.pageHeight - 10);
      
      // Número de página (derecha)
      const pageText = `Página ${i} de ${pageCount}`;
      const pageTextWidth = this.pdf.getTextWidth(pageText);
      this.pdf.text(pageText, this.pageWidth - this.margin - pageTextWidth, this.pageHeight - 10);
    }
  }

  // Método alternativo: generar PDF estructurado sin html2canvas
  async generateStructuredPDF(
    elementId: string,
    options: PDFGeneratorOptions
  ): Promise<void> {
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error(`Elemento con ID '${elementId}' no encontrado`);
    }

    try {
      // Añadir header
      this.addHeader(options.title, options.subtitle, options.headerColor);
      
      let currentY = this.currentY + 20;
      
      // 1. Agregar información de filtros
      const filtersData = this.extractFiltersData(element);
      if (filtersData) {
        currentY = this.addFiltersSection(filtersData, currentY);
      }
      
      // 2. Agregar KPIs
      const kpisData = this.extractKPIsData(element);
      if (kpisData) {
        currentY = this.addKPIsSection(kpisData, currentY);
      }
      
      // 3. Agregar gráficos (como imagen)
      const chartsData = await this.extractChartsData(element);
      if (chartsData.length > 0) {
        currentY = await this.addChartsSection(chartsData, currentY);
      }
      
      // 4. Agregar tabla de datos
      const tableData = this.extractTableData(element);
      if (tableData) {
        currentY = this.addTableSection(tableData, currentY);
      }
      
      // Añadir footer
      if (options.includeTimestamp) {
        this.addFooter();
      }

      // Descargar el PDF
      const filename = options.filename || `${options.title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
      this.pdf.save(filename);

    } catch (error) {
      console.error('Error generando PDF estructurado:', error);
      throw new Error('Error al generar el PDF. Por favor, inténtalo de nuevo.');
    }
  }

  private extractFiltersData(element: HTMLElement): any {
    const filtersForm = element.querySelector('form');
    if (!filtersForm) return null;

    const filters: any = {};
    
    // Extraer select de agrupación
    const groupSelect = filtersForm.querySelector('select') as HTMLSelectElement;
    if (groupSelect) {
      filters.groupBy = groupSelect.options[groupSelect.selectedIndex].text;
    }
    
    // Extraer fechas
    const dateInputs = filtersForm.querySelectorAll('input[type="date"]');
    if (dateInputs.length >= 2) {
      filters.desde = (dateInputs[0] as HTMLInputElement).value;
      filters.hasta = (dateInputs[1] as HTMLInputElement).value;
    }

    return filters;
  }

  private extractKPIsData(element: HTMLElement): any {
    const kpiCards = element.querySelectorAll('.card');
    const kpis: any[] = [];

    kpiCards.forEach(card => {
      const title = card.querySelector('.card-header, h6, h5, h4')?.textContent?.trim();
      if (title && (title.includes('Total') || title.includes('Recaudación') || title.includes('Valor') || title.includes('Usuarios'))) {
        const valueElement = card.querySelector('.display-6, h1, h2, h3, .h1, .h2, .h3');
        const value = valueElement?.textContent?.trim();
        const subtitle = card.querySelector('p, .text-muted, small')?.textContent?.trim();
        
        if (value) {
          kpis.push({ title, value, subtitle });
        }
      }
    });

    return kpis.length > 0 ? kpis : null;
  }

  private async extractChartsData(element: HTMLElement): Promise<any[]> {
    const charts: any[] = [];
    const canvases = element.querySelectorAll('canvas');
    
    for (const canvas of canvases) {
      try {
        const chartTitle = canvas.closest('.card')?.querySelector('.card-header')?.textContent?.trim() || 'Gráfico';
        const imgData = (canvas as HTMLCanvasElement).toDataURL('image/png');
        charts.push({ title: chartTitle, imgData });
      } catch (error) {
        console.warn('Error al extraer gráfico:', error);
      }
    }
    
    return charts;
  }

  private extractTableData(element: HTMLElement): any {
    const table = element.querySelector('table');
    if (!table) return null;

    const headers: string[] = [];
    const rows: string[][] = [];

    // Extraer headers
    const headerCells = table.querySelectorAll('thead th');
    headerCells.forEach(cell => {
      headers.push(cell.textContent?.trim() || '');
    });

    // Extraer filas de datos
    const dataRows = table.querySelectorAll('tbody tr');
    dataRows.forEach(row => {
      const cells = row.querySelectorAll('td');
      if (cells.length > 0) {
        const rowData: string[] = [];
        cells.forEach(cell => {
          rowData.push(cell.textContent?.trim() || '');
        });
        rows.push(rowData);
      }
    });

    return headers.length > 0 ? { headers, rows } : null;
  }

  private addFiltersSection(filters: any, startY: number): number {
    this.pdf.setFontSize(12);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setTextColor('#333333');
    this.pdf.text('Filtros Aplicados:', this.margin, startY);

    let currentY = startY + 8;
    this.pdf.setFontSize(10);
    this.pdf.setFont('helvetica', 'normal');

    if (filters.groupBy) {
      this.pdf.text(`• Agrupación: ${filters.groupBy}`, this.margin + 5, currentY);
      currentY += 5;
    }
    
    if (filters.desde && filters.hasta) {
      this.pdf.text(`• Período: ${filters.desde} al ${filters.hasta}`, this.margin + 5, currentY);
      currentY += 5;
    }

    return currentY + 10;
  }

  private addKPIsSection(kpis: any[], startY: number): number {
    this.pdf.setFontSize(12);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setTextColor('#333333');
    this.pdf.text('Resumen:', this.margin, startY);

    let currentY = startY + 15;
    const cardWidth = (this.pageWidth - this.margin * 2 - 20) / 3; // 3 columnas con espacio

    kpis.forEach((kpi, index) => {
      const x = this.margin + (index % 3) * (cardWidth + 10);
      
      // Fondo del KPI
      this.pdf.setFillColor('#f8f9fa');
      this.pdf.rect(x, currentY - 10, cardWidth, 25, 'F');
      
      // Borde
      this.pdf.setDrawColor('#dee2e6');
      this.pdf.setLineWidth(0.1);
      this.pdf.rect(x, currentY - 10, cardWidth, 25);
      
      // Título
      this.pdf.setFontSize(9);
      this.pdf.setFont('helvetica', 'bold');
      this.pdf.setTextColor('#666666');
      this.pdf.text(kpi.title, x + 2, currentY - 5);
      
      // Valor
      this.pdf.setFontSize(14);
      this.pdf.setFont('helvetica', 'bold');
      this.pdf.setTextColor('#333333');
      this.pdf.text(kpi.value, x + 2, currentY + 5);
      
      // Subtítulo
      if (kpi.subtitle) {
        this.pdf.setFontSize(8);
        this.pdf.setFont('helvetica', 'normal');
        this.pdf.setTextColor('#999999');
        this.pdf.text(kpi.subtitle, x + 2, currentY + 12);
      }
    });

    return currentY + 35;
  }

  private async addChartsSection(charts: any[], startY: number): Promise<number> {
    let currentY = startY;
    
    for (const chart of charts) {
      // Verificar si hay espacio en la página
      if (currentY + 80 > this.pageHeight - 40) {
        this.pdf.addPage();
        this.addHeader('Continuación', '', '#2563eb');
        currentY = this.currentY + 20;
      }

      // Título del gráfico
      this.pdf.setFontSize(11);
      this.pdf.setFont('helvetica', 'bold');
      this.pdf.setTextColor('#333333');
      this.pdf.text(chart.title, this.margin, currentY);
      currentY += 10;

      // Agregar imagen del gráfico
      try {
        const chartWidth = this.pageWidth - this.margin * 2;
        const chartHeight = 60;
        
        this.pdf.addImage(chart.imgData, 'PNG', this.margin, currentY, chartWidth, chartHeight);
        currentY += chartHeight + 15;
      } catch (error) {
        console.warn('Error al agregar gráfico al PDF:', error);
        currentY += 20;
      }
    }

    return currentY;
  }

  private addTableSection(tableData: any, startY: number): number {
    let currentY = startY;
    
    // Verificar si hay espacio
    if (currentY + 40 > this.pageHeight - 40) {
      this.pdf.addPage();
      this.addHeader('Continuación', '', '#2563eb');
      currentY = this.currentY + 20;
    }

    // Título de la tabla
    this.pdf.setFontSize(11);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setTextColor('#333333');
    this.pdf.text('Datos Detallados:', this.margin, currentY);
    currentY += 15;

    // Configuración de la tabla
    const colWidth = (this.pageWidth - this.margin * 2) / tableData.headers.length;
    const rowHeight = 8;

    // Headers
    this.pdf.setFillColor('#f8f9fa');
    this.pdf.rect(this.margin, currentY - 5, this.pageWidth - this.margin * 2, rowHeight, 'F');
    
    this.pdf.setDrawColor('#dee2e6');
    this.pdf.setLineWidth(0.1);
    
    tableData.headers.forEach((header: string, index: number) => {
      const x = this.margin + (index * colWidth);
      
      // Borde de celda
      this.pdf.rect(x, currentY - 5, colWidth, rowHeight);
      
      // Texto del header
      this.pdf.setFontSize(9);
      this.pdf.setFont('helvetica', 'bold');
      this.pdf.setTextColor('#333333');
      this.pdf.text(header, x + 2, currentY);
    });
    
    currentY += rowHeight;

    // Filas de datos (máximo 15 por página)
    const maxRowsPerPage = Math.min(tableData.rows.length, 15);
    
    for (let i = 0; i < maxRowsPerPage; i++) {
      const row = tableData.rows[i];
      
      // Verificar espacio en página
      if (currentY + rowHeight > this.pageHeight - 40) {
        this.pdf.addPage();
        this.addHeader('Continuación', '', '#2563eb');
        currentY = this.currentY + 20;
        
        // Repetir headers en nueva página
        this.pdf.setFillColor('#f8f9fa');
        this.pdf.rect(this.margin, currentY - 5, this.pageWidth - this.margin * 2, rowHeight, 'F');
        
        tableData.headers.forEach((header: string, index: number) => {
          const x = this.margin + (index * colWidth);
          this.pdf.rect(x, currentY - 5, colWidth, rowHeight);
          this.pdf.setFontSize(9);
          this.pdf.setFont('helvetica', 'bold');
          this.pdf.setTextColor('#333333');
          this.pdf.text(header, x + 2, currentY);
        });
        
        currentY += rowHeight;
      }

      // Fila de datos
      row.forEach((cell: string, index: number) => {
        const x = this.margin + (index * colWidth);
        
        // Borde de celda
        this.pdf.setDrawColor('#dee2e6');
        this.pdf.rect(x, currentY - 5, colWidth, rowHeight);
        
        // Texto de la celda
        this.pdf.setFontSize(8);
        this.pdf.setFont('helvetica', 'normal');
        this.pdf.setTextColor('#333333');
        
        // Truncar texto si es muy largo
        let cellText = cell;
        if (cellText.length > 20) {
          cellText = cellText.substring(0, 17) + '...';
        }
        
        this.pdf.text(cellText, x + 2, currentY);
      });
      
      currentY += rowHeight;
    }

    return currentY + 10;
  }
}

// Función utilitaria para uso rápido
export const generatePDFFromElement = async (
  elementId: string,
  title: string,
  subtitle?: string,
  filename?: string
): Promise<void> => {
  const generator = new PDFGenerator();
  await generator.generateFromElement(elementId, {
    title,
    subtitle,
    filename,
    headerColor: '#2563eb',
    includeTimestamp: true
  });
};

// Nueva función utilitaria para PDF estructurado
export const generateStructuredPDFFromElement = async (
  elementId: string,
  title: string,
  subtitle?: string,
  filename?: string
): Promise<void> => {
  const generator = new PDFGenerator();
  await generator.generateStructuredPDF(elementId, {
    title,
    subtitle,
    filename,
    headerColor: '#2563eb',
    includeTimestamp: true
  });
};