import React, { useState, useRef } from 'react';
import { Dialog, AppBar, Toolbar, IconButton, Button, Typography, Box } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PrintIcon from '@mui/icons-material/Print';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

import DeliveryNoteDocument from './DeliveryNoteDocument.jsx';

const DeliveryNotePreviewModal = ({ open, onClose, onConfirm, neData, isSaved, onFinalize, isReadOnly = false }) => {
  const documentRef = useRef();
  const [isSaving, setIsSaving] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleExportPDF = () => {
    const input = documentRef.current;
    if (!input) return;

    // 1. Hide the "VISTA PREVIA" label for capture
    const labelElement = input.querySelector('.document-copy-label');
    if (labelElement) {
      labelElement.style.display = 'none'; // Hide it
    }

    const scrollContainer = input.closest('.print-background-container');
    const originalOverflow = scrollContainer ? scrollContainer.style.overflow : '';
    if (scrollContainer) scrollContainer.style.overflow = 'visible';

    html2canvas(input, {
      scale: 2,
      useCORS: true,
      scrollY: -window.scrollY,
      height: input.scrollHeight,
      windowHeight: input.scrollHeight
    }).then((canvas) => {
      // Restore UI
      if (scrollContainer) scrollContainer.style.overflow = originalOverflow;
      if (labelElement) {
        labelElement.style.display = ''; // Restore
      }

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'letter');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = pdfWidth / imgWidth;
      let imgHeightInPdf = imgHeight * ratio;

      // Helper to add page with specific label
      const addPageWithLabel = (label, isFirst = false) => {
        if (!isFirst) pdf.addPage();

        // Add image
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, imgHeightInPdf);

        // Add Label manually
        pdf.setTextColor(211, 47, 47); // error.main color (approx red)
        pdf.setFontSize(12);
        pdf.setFont(undefined, 'bold');

        // Calculate position: Bottom center
        const textY = pageHeight - 15;
        pdf.text(label, pdfWidth / 2, textY, { align: 'center' });
      };

      // 1. ORIGINAL - CLIENTE
      addPageWithLabel("ORIGINAL - CLIENTE", true);

      // 2. COPIA - PROVEEDOR
      addPageWithLabel("COPIA - PROVEEDOR");

      // 3. COPIA - TRANSPORTE
      addPageWithLabel("COPIA - TRANSPORTE");

      pdf.save(`NotaDeEntrega-${neData.correlative || 'preview'}.pdf`);

    }).catch(err => {
      if (scrollContainer) scrollContainer.style.overflow = originalOverflow;
      if (labelElement) labelElement.style.display = '';
      console.error("Error al generar PDF con html2canvas:", err);
      alert("Error al generar PDF. Ver consola.");
    });
  };

  const handleConfirmClick = async () => {
    setIsSaving(true);
    try {
      await onConfirm();
    } catch (error) {
      console.error("Fallo al guardar la Nota de Entrega:", error);
    }
    setIsSaving(false);
  };

  return (
    <>
      <Dialog fullScreen open={open} onClose={() => { if (!isSaving) onClose(); }}>
        <AppBar sx={{ position: 'relative' }}>
          <Toolbar>
            <IconButton edge="start" color="inherit" onClick={onClose} aria-label="close" disabled={isSaving}>
              <CloseIcon />
            </IconButton>
            <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
              Vista Previa - Nota de Entrega
            </Typography>

            <Button color="inherit" startIcon={<PrintIcon />} onClick={handlePrint} disabled={!isSaved || isSaving}>
              Imprimir
            </Button>
            <Button color="inherit" startIcon={<PictureAsPdfIcon />} onClick={handleExportPDF} disabled={!isSaved || isSaving}>
              Exportar a PDF
            </Button>

            {!isSaved ? (
              <Button
                color="inherit"
                onClick={handleConfirmClick}
                variant="outlined"
                disabled={isSaving}
                sx={{ ml: 2, borderColor: 'white', color: 'white' }}
              >
                {isSaving ? 'Guardando...' : 'Confirmar y Guardar'}
              </Button>
            ) : (
              // Solo mostramos "Finalizar" si NO es modo solo lectura
              !isReadOnly && (
                <Button
                  onClick={onFinalize}
                  variant="contained"
                  color="secondary"
                  sx={{ ml: 2 }}
                >
                  Finalizar
                </Button>
              )
            )}
          </Toolbar>
        </AppBar>

        <style>
          {`
            @media print {
              @page {
                size: letter;
                margin: 0mm;
              }
              html, body { 
                margin: 0 !important; padding: 0 !important; 
                width: 216mm !important; height: auto !important; 
                overflow: visible !important;
                background-color: #fff !important;
              }
              
              /* Hide everything by default */
              body * { visibility: hidden; }
              
              /* Show only the print container and its children */
              #document-to-print-deliverynote, #document-to-print-deliverynote * { 
                visibility: visible; 
              }

              /* Position the print container to fill the page */
              #document-to-print-deliverynote {
                position: absolute !important;
                left: 0 !important;
                top: 0 !important;
                width: 216mm !important; /* Force Letter width */
                margin: 0 !important;
                padding: 0 !important;
                background-color: #fff;
                display: block !important;
                z-index: 9999;
              }

              /* Style the pages inside */
              #document-to-print-deliverynote > .MuiBox-root {
                 width: 100% !important; 
                 min-height: 279mm !important; /* Force Letter height */
                 page-break-after: always; 
                 break-after: page;
                 position: relative;
                 display: block;
              }
              #document-to-print-deliverynote > .MuiBox-root:last-child {
                 page-break-after: auto; 
                 break-after: auto;
              }

              /* Reset Paper styles for print */
              #document-to-print-deliverynote .MuiPaper-root {
                box-shadow: none !important; 
                border: none !important; 
                margin: 0 !important;
                padding: 15mm !important; /* Print margins */
                width: 100% !important;
                max-width: none !important; /* CRITICAL: Override 800px limit */
                height: auto !important;
                box-sizing: border-box !important;
              }
              
              /* Hide the app bar and preview container explicitly */
              .MuiAppBar-root { display: none !important; } 
              .print-background-container { display: none !important; }

              /* Reset Dialog styles */
              .MuiDialog-root, .MuiDialog-container, .MuiPaper-root {
                position: static !important;
                overflow: visible !important;
                width: auto !important;
                height: auto !important;
                background: none !important;
                box-shadow: none !important;
                margin: 0 !important;
                padding: 0 !important;
              }
            }
          `}
        </style>

        <Box className="print-background-container" sx={{
          p: 3,
          backgroundColor: '#e0e0e0',
          height: 'calc(100vh - 64px)',
          overflow: 'auto',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start'
        }}>
          {/* Vista previa en pantalla (solo 1 copia) */}
          <DeliveryNoteDocument ref={documentRef} neData={neData} copyLabel="VISTA PREVIA" />
        </Box>
      </Dialog>

      {/* Contenido oculto para imprimir (3 copias) - OUTSIDE the preview container and Dialog */}
      <div id="document-to-print-deliverynote" style={{ display: 'none' }}>
        <Box sx={{ pageBreakAfter: 'always', breakAfter: 'page' }}>
          <DeliveryNoteDocument neData={neData} copyLabel="ORIGINAL - CLIENTE" isForPrint={true} />
        </Box>
        <Box sx={{ pageBreakAfter: 'always', breakAfter: 'page' }}>
          <DeliveryNoteDocument neData={neData} copyLabel="COPIA - PROVEEDOR" isForPrint={true} />
        </Box>
        <Box>
          <DeliveryNoteDocument neData={neData} copyLabel="COPIA - TRANSPORTE" isForPrint={true} />
        </Box>
      </div>
    </>
  );
};

export default DeliveryNotePreviewModal;