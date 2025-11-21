import React, { useRef } from 'react';
import { Dialog, AppBar, Toolbar, IconButton, Button, Typography, Box } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PrintIcon from '@mui/icons-material/Print';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import KardexDocument from './KardexDocument.jsx'; // Importamos el documento Kardex
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const KardexPreviewModal = ({ open, onClose, kardexData, productInfo }) => {
    const documentRef = useRef();

    const handlePrint = () => window.print();

    const handleExportPDF = () => {
        const input = documentRef.current;
        if (!input) return;

        html2canvas(input, { scale: 2, useCORS: true, scrollY: -window.scrollY })
        .then((canvas) => {
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4'); // Kardex usualmente vertical (p)
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();
            const imgWidth = canvas.width;
            const imgHeight = canvas.height;
            const ratio = pdfWidth / imgWidth;
            const imgHeightInPdf = imgHeight * ratio;
            let position = 0;

            pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeightInPdf);
            let heightLeft = imgHeightInPdf - pageHeight;

            while (heightLeft > 0) {
                position = position - pageHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeightInPdf);
                heightLeft -= pageHeight;
            }

            pdf.save(`Kardex_${productInfo?.sku || 'producto'}_${new Date().toLocaleDateString('es-VE')}.pdf`);
        });
    };

    return (
        <Dialog fullScreen open={open} onClose={onClose}>
            <AppBar sx={{ position: 'relative' }}>
                <Toolbar>
                    <IconButton edge="start" color="inherit" onClick={onClose}><CloseIcon /></IconButton>
                    <Typography sx={{ ml: 2, flex: 1 }} variant="h6">Vista Previa - Kardex de Producto</Typography>
                    <Button color="inherit" startIcon={<PrintIcon />} onClick={handlePrint}>Imprimir</Button>
                    <Button color="inherit" startIcon={<PictureAsPdfIcon />} onClick={handleExportPDF}>Exportar a PDF</Button>
                </Toolbar>
            </AppBar>

            {/* Estilos de impresión (iguales a los de StockPreviewModal) */}
            <style>
                {`
                    @page { size: letter; margin: 10mm !important; }
                    @media print {
                        html, body { margin: 0 !important; padding: 0 !important; width: 100% !important; height: 100vh !important; overflow: hidden !important; }
                        body * { visibility: hidden; }
                        #document-to-print-kardex, #document-to-print-kardex * { visibility: visible; }
                        #document-to-print-kardex { position: absolute; left: 0; top: 0; width: 100%; height: 100% !important; margin: 0 !important; padding: 0 !important; box-shadow: none !important; border: none !important; display: flex; flex-direction: column; }
                        #document-to-print-kardex > .MuiPaper-root { max-width: none !important; width: 100% !important; height: 100% !important; box-shadow: none !important; border: none !important; margin: 0 !important; padding: 10mm !important; display: flex !important; flex-direction: column !important; min-height: auto !important; }
                        .MuiAppBar-root { display: none !important; }
                        .print-background-container { background-color: transparent !important; padding: 0 !important; height: auto !important; overflow: visible !important; }
                    }
                `}
            </style>

            <Box className="print-background-container" sx={{ p: 3, backgroundColor: '#e0e0e0', minHeight: '100vh', overflowY: 'auto' }}>
                {/* ID único para este documento */}
                <div id="document-to-print-kardex">
                    <KardexDocument ref={documentRef} kardexData={kardexData} productInfo={productInfo} />
                </div>
            </Box>
        </Dialog>
    );
};

export default KardexPreviewModal;