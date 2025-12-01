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
        <>
            <Dialog fullScreen open={open} onClose={onClose}>
                <AppBar sx={{ position: 'relative' }}>
                    <Toolbar>
                        <IconButton edge="start" color="inherit" onClick={onClose}><CloseIcon /></IconButton>
                        <Typography sx={{ ml: 2, flex: 1 }} variant="h6">Vista Previa - Reporte de Stock</Typography>
                        <Button color="inherit" startIcon={<PrintIcon />} onClick={handlePrint}>Imprimir</Button>
                        <Button color="inherit" startIcon={<PictureAsPdfIcon />} onClick={handleExportPDF}>Exportar a PDF</Button>
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
                            #document-to-print, #document-to-print * { 
                                visibility: visible; 
                            }

                            /* Position the print container to fill the page */
                            #document-to-print {
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
                            #document-to-print > .MuiPaper-root {
                                width: 100% !important; 
                                max-width: none !important; /* CRITICAL: Override max-width */
                                min-height: 279mm !important; /* Force Letter height */
                                margin: 0 !important;
                                padding: 15mm !important; /* Print margins */
                                box-shadow: none !important; 
                                border: none !important; 
                                height: auto !important;
                                box-sizing: border-box !important;
                            }

                            /* Hide the app bar and preview container explicitly */
                            .MuiAppBar-root { display: none !important; } 
                            .print-background-container { display: none !important; }

                            /* Reset Dialog styles */
                            .MuiDialog-root, .MuiDialog-container {
                                position: static !important;
                                overflow: visible !important;
                                width: auto !important;
                                height: auto !important;
                                background: none !important;
                                box-shadow: none !important;
                                margin: 0 !important;
                                padding: 0 !important;
                                display: none !important;
                            }
                        }
                    `}
                </style>

                <Box className="print-background-container" sx={{ p: 3, backgroundColor: '#e0e0e0', minHeight: '100vh', overflowY: 'auto', display: 'flex', justifyContent: 'center' }}>
                    {/* Vista previa en pantalla */}
                    <StockDocument ref={documentRef} stockData={stockData} />
                </Box>
            </Dialog>

            {/* Contenido oculto para imprimir - OUTSIDE the Dialog */}
            <div id="document-to-print" style={{ display: 'none' }}>
                <StockDocument stockData={stockData} isForPrint={true} />
            </div>
        </>
    );
};

export default StockPreviewModal;