import React, { useState, useRef } from 'react';
import { Dialog, AppBar, Toolbar, IconButton, Button, Typography, Box } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PrintIcon from '@mui/icons-material/Print';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// ¡NUEVO! Importamos el documento de Nota de Entrega
import DeliveryNoteDocument from './DeliveryNoteDocument.jsx'; 

const DeliveryNotePreviewModal = ({ open, onClose, onConfirm, neData }) => {
  const documentRef = useRef(); // Referencia al componente DeliveryNoteDocument
  const [isSaving, setIsSaving] = useState(false); // Estado para deshabilitar botones al guardar

  // Función para activar la impresión del navegador
  const handlePrint = () => {
    window.print();
  };

  // Función para exportar el documento a PDF
  const handleExportPDF = () => {
    const input = documentRef.current; // El elemento <Paper> del DeliveryNoteDocument
    if (!input) return;

    // Ocultar temporalmente el scroll del contenedor gris para captura completa
    const scrollContainer = input.closest('.print-background-container');
    const originalOverflow = scrollContainer.style.overflow;
    scrollContainer.style.overflow = 'visible'; 
    
    html2canvas(input, {
      scale: 2, 
      useCORS: true,
      scrollY: -window.scrollY, 
      height: input.scrollHeight,
      windowHeight: input.scrollHeight
    }).then((canvas) => {
      // Restaurar el scroll del contenedor gris
      scrollContainer.style.overflow = originalOverflow;
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'letter'); // PDF tamaño carta, vertical
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = pdfWidth / imgWidth;
      let imgHeightInPdf = imgHeight * ratio; 
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeightInPdf);
      let heightLeft = imgHeightInPdf - pageHeight;
      
      while (heightLeft > 0) {
        position = position - pageHeight; 
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeightInPdf);
        heightLeft -= pageHeight;
      }

      // Guarda el PDF con un nombre descriptivo
      pdf.save(`NotaDeEntrega-${neData.correlative || 'preview'}.pdf`);
      
    }).catch(err => {
      scrollContainer.style.overflow = originalOverflow;
      console.error("Error al generar PDF con html2canvas:", err);
      alert("Error al generar PDF. Ver consola.");
    });
  };

  // Función que maneja el clic en "Confirmar y Guardar"
  const handleConfirmClick = async () => {
    setIsSaving(true); // Deshabilita los botones
    try {
      // ¡Aquí se llama a la función de guardado!
      await onConfirm(); 
    } catch (error) {
      console.error("Fallo al guardar la Nota de Entrega:", error);
      setIsSaving(false);
    }
    // No cerramos el modal ni ponemos 'isSaving' en false aquí,
    // porque 'onConfirm' (en la página principal) se encargará de
    // cerrar el modal y redirigir.
  };

  return (
    <Dialog fullScreen open={open} onClose={() => { if (!isSaving) onClose(); }}>
      {/* Barra superior con acciones */}
      <AppBar sx={{ position: 'relative' }}>
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={onClose} aria-label="close" disabled={isSaving}>
            <CloseIcon />
          </IconButton>
          <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
            Vista Previa - Nota de Entrega
          </Typography>
          
          <Button color="inherit" startIcon={<PrintIcon />} onClick={handlePrint} disabled={isSaving}>
            Imprimir
          </Button>
          <Button color="inherit" startIcon={<PictureAsPdfIcon />} onClick={handleExportPDF} disabled={isSaving}>
            Exportar a PDF
          </Button>
          <Button
            color="inherit"
            onClick={handleConfirmClick}
            variant="outlined"
            disabled={isSaving} 
          >
            {isSaving ? 'Guardando...' : 'Confirmar y Guardar'}
          </Button>
        </Toolbar>
      </AppBar>
      
      {/* --- ESTILOS PARA IMPRESIÓN --- */}
      {/* Usamos un ID único 'document-to-print-deliverynote' */}
      <style>
        {`
          @page {
            size: letter portrait; /* ¡Importante para la impresión vertical! */
            margin: 10mm !important; 
          }
          @media print {
            html, body { margin: 0 !important; padding: 0 !important; width: 100% !important; height: 100vh !important; overflow: hidden !important;
            background-color: #fff !important;}
            body * { visibility: hidden; }
            #document-to-print-deliverynote, #document-to-print-deliverynote * { visibility: visible; }
            #document-to-print-deliverynote {
              position: absolute !important; left: 0; top: 0; width: 100% !important; height: 100% !important; 
              margin: 0 !important; padding: 0 !important; box-shadow: none !important; border: none !important;
              display: flex !important; flex-direction: column !important; background-color: #fff !important;
            }
            #document-to-print-deliverynote > .MuiPaper-root {
              max-width: none !important; width: 100% !important; height: 100% !important; 
              box-shadow: none !important; border: none !important; margin: 0 !important;
              padding: 10mm !important; 
              display: flex !important; flex-direction: column !important; min-height: auto !important;
              box-sizing: border-box !important; background-color: #fff !important; color: #000 !important;
              position: static !important; /* Resetea la posición absoluta al imprimir */
            }
            #document-to-print-deliverynote .MuiTableCell-root {
              color: #000 !important;
            }
            /* Oculta la barra de App y el fondo gris al imprimir */
            .MuiAppBar-root { display: none !important; } 
            .print-background-container { background-color: transparent !important; padding: 0 !important; height: auto !important; overflow: visible !important; }
          }
        `}
      </style>
      {/* --- FIN ESTILOS PARA IMPRESIÓN --- */}

      {/* --- CONTENEDOR GRIS CON SCROLL --- */}
      <Box className="print-background-container" sx={{
        p: 3, 
        backgroundColor: '#e0e0e0', 
        height: 'calc(100vh - 64px)', 
        overflow: 'auto', 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'flex-start' 
      }}>
        {/* Div imprimible (con ID único) */}
        <div id="document-to-print-deliverynote">
          {/* Renderiza el documento pasándole los datos y la ref */}
          <DeliveryNoteDocument ref={documentRef} neData={neData} />
        </div>
      </Box>
    </Dialog>
  );
};

export default DeliveryNotePreviewModal;