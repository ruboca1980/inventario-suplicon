import React, { useState, useRef } from 'react';
import { Dialog, AppBar, Toolbar, IconButton, Button, Typography, Box } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PrintIcon from '@mui/icons-material/Print';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import ExitDocument from './ExitDocument.jsx';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const ExitPreviewModal = ({ open, onClose, onConfirm, exitData, isSaved }) => {
    const documentRef = useRef();
    const [isSaving, setIsSaving] = useState(false);

    const handlePrint = () => {
        window.print();
    };

    const handleExportPDF = () => {
        const input = documentRef.current;
        if (!input) return;
        html2canvas(input, { scale: 2, useCORS: true, scrollY: -window.scrollY })
            .then((canvas) => {
                const imgData = canvas.toDataURL('image/png');
                const pdf = new jsPDF('p', 'mm', 'letter');
                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pageHeight = pdf.internal.pageSize.getHeight();
                const imgWidth = canvas.width;
                const imgHeight = canvas.height;
                const ratio = pdfWidth / imgWidth;
                const imgHeightInPdf = imgHeight * ratio;
                let position = 0;
                if (imgHeightInPdf <= pageHeight) {
                    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, imgHeightInPdf);
                } else {
                    let heightLeft = imgHeightInPdf;
                    pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeightInPdf);
                    heightLeft -= pageHeight;
                    while (heightLeft > 0) {
                        position = position - pageHeight;
                        pdf.addPage();
                        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeightInPdf);
                        heightLeft -= pageHeight;
                    }
                }
                pdf.save(`Salida-${exitData.correlative || 'preview'}.pdf`);
            });
    };

    const handleConfirmClick = async () => {
        setIsSaving(true);
        try {
            await onConfirm();
            setIsSaving(false);
        } catch (error) {
            console.error("Fallo al guardar la salida:", error);
            setIsSaving(false);
        }
    };

    return (
        <Dialog fullScreen open={open} onClose={() => { if (!isSaving) onClose(); }}> {/* Evita cerrar si está guardando */}
            <AppBar sx={{ position: 'relative' }}>
                <Toolbar>
                    <IconButton edge="start" color="inherit" onClick={onClose} aria-label="close" disabled={isSaving}><CloseIcon /></IconButton>
                    <Typography sx={{ ml: 2, flex: 1 }} variant="h6">Vista Previa de Salida</Typography>

                    {isSaved && (
                        <>
                            <Button color="inherit" startIcon={<PrintIcon />} onClick={handlePrint} disabled={isSaving}>Imprimir</Button>
                            <Button color="inherit" startIcon={<PictureAsPdfIcon />} onClick={handleExportPDF} disabled={isSaving}>Exportar a PDF</Button>
                        </>
                    )}

                    {!isSaved && (
                        <Button color="inherit" onClick={handleConfirmClick} variant="outlined" disabled={isSaving}>
                            {isSaving ? 'Guardando...' : 'Confirmar y Guardar'}
                        </Button>
                    )}
                </Toolbar>
            </AppBar>

            {/* --- INICIO DE ESTILOS DE IMPRESIÓN CORREGIDOS --- */}
            <style>
                {`
                    @page {
                        size: letter;
                        margin: 10mm !important;
                    }

                    @media print {
                        html, body {
                            margin: 0 !important;
                            padding: 0 !important;
                            width: 100% !important;
                            height: 100vh !important;
                            overflow: hidden !important;
                        }
                        body * { visibility: hidden; }
                        #document-to-print-exit, #document-to-print-exit * { visibility: visible; } /* ID único */
                        #document-to-print-exit {
                            position: absolute;
                            left: 0;
                            top: 0;
                            width: 100%;
                            height: 100% !important;
                            margin: 0 !important;
                            padding: 0 !important;
                            box-shadow: none !important;
                            border: none !important;
                            display: flex;
                            flex-direction: column;
                        }
                         #document-to-print-exit > .MuiPaper-root { /* Estilos para el Paper interno */
                            max-width: none !important;
                            width: 100% !important;
                            height: 100% !important;
                            box-shadow: none !important;
                            border: none !important;
                            margin: 0 !important;
                            padding: 10mm !important;
                            display: flex !important;
                            flex-direction: column !important;
                            min-height: auto !important;
                        }
                        .MuiAppBar-root { display: none !important; }
                        .print-background-container { background-color: transparent !important; padding: 0 !important; height: auto !important; overflow: visible !important; }
                    }
                `}
            </style>
            {/* --- FIN DE ESTILOS DE IMPRESIÓN --- */}

            <Box className="print-background-container" sx={{
                p: 3,
                backgroundColor: '#e0e0e0',
                minHeight: 'calc(100vh - 64px)', // Ajuste para restar la altura aproximada del AppBar
                overflow: 'auto',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'flex-start'
            }}>
                {/* ID único para este documento */}
                <div id="document-to-print-exit">
                    <ExitDocument ref={documentRef} exitData={exitData} />
                </div>
            </Box>
        </Dialog>
    );
};

export default ExitPreviewModal;