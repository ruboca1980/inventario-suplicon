import React, { useRef } from 'react';
import { Dialog, AppBar, Toolbar, IconButton, Button, Typography, Box } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PrintIcon from '@mui/icons-material/Print';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import StockDocument from './StockDocument.jsx';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const StockPreviewModal = ({ open, onClose, stockData }) => {
    const documentRef = useRef();

    const handlePrint = () => window.print();

    // --- FUNCIÓN handleExportPDF CORREGIDA ---
    const handleExportPDF = () => {
        const input = documentRef.current;
        if (!input) return;

        html2canvas(input, {
            scale: 2, // Mejora resolución
            useCORS: true,
            scrollY: -window.scrollY // Captura desde el inicio del scroll
        }).then((canvas) => {
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'letter'); // Tamaño Carta
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const imgWidth = canvas.width;
            const imgHeight = canvas.height;
            
            // Calcula la altura de la imagen en el PDF manteniendo la proporción del ancho
            const ratio = pdfWidth / imgWidth;
            const imgHeightInPdf = imgHeight * ratio;
            let position = 0;
            let pageCount = 1;
            // Si la imagen cabe en una página
            if (imgHeightInPdf <= pdfHeight) {
                pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, imgHeightInPdf);
            } else { // Si la imagen es más alta que una página
                let heightLeft = imgHeightInPdf;
                pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeightInPdf);
                heightLeft -= pdfHeight;
                while (heightLeft > 0) {
                    position -= pdfHeight; // Mueve la "ventana" de la imagen hacia abajo
                    pdf.addPage();
                    pageCount++;
                    pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeightInPdf);
                    heightLeft -= pdfHeight;
                }
            }
            
            pdf.save(`Reporte_Stock_${new Date().toLocaleDateString('es-VE')}.pdf`);
        });
    };
    return (
        <Dialog fullScreen open={open} onClose={onClose}>
            <AppBar sx={{ position: 'relative' }}>
                <Toolbar>
                    <IconButton edge="start" color="inherit" onClick={onClose}><CloseIcon /></IconButton>
                    <Typography sx={{ ml: 2, flex: 1 }} variant="h6">Vista Previa - Reporte de Stock</Typography>
                    <Button color="inherit" startIcon={<PrintIcon />} onClick={handlePrint}>Imprimir</Button>
                    <Button color="inherit" startIcon={<PictureAsPdfIcon />} onClick={handleExportPDF}>Exportar a PDF</Button>
                </Toolbar>
            </AppBar>

            {/* Estilos de impresión (sin cambios relevantes aquí) */}
            <style>
                {`
                    @page { size: letter; margin: 10mm !important; }
                    @media print {
                        html, body { margin: 0 !important; padding: 0 !important; width: 100% !important; height: 100vh !important; overflow: hidden !important; }
                        body * { visibility: hidden; }
                        #document-to-print, #document-to-print * { visibility: visible; }
                        #document-to-print { position: absolute; left: 0; top: 0; width: 100%; height: 100% !important; margin: 0 !important; padding: 0 !important; box-shadow: none !important; border: none !important; display: flex; flex-direction: column; }
                        #document-to-print > .MuiPaper-root { max-width: none !important; width: 100% !important; height: 100% !important; box-shadow: none !important; border: none !important; margin: 0 !important; padding: 10mm !important; display: flex !important; flex-direction: column !important; min-height: auto !important; }
                        .MuiAppBar-root { display: none !important; }
                        .print-background-container { background-color: transparent !important; padding: 0 !important; height: auto !important; overflow: visible !important; }
                    }
                `}
            </style>
            
            <Box className="print-background-container" sx={{ p: 3, backgroundColor: '#e0e0e0', minHeight: '100vh', overflowY: 'auto' }}>
                <div id="document-to-print">
                    <StockDocument ref={documentRef} stockData={stockData} />
                </div>
            </Box>
        </Dialog>
    );
};

export default StockPreviewModal;