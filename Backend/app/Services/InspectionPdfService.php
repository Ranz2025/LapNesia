<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\InspectionReport;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Storage;

class InspectionPdfService
{
    public function generate(InspectionReport $report): string
    {
        $report->load(['job.product.brand', 'job.product.category', 'technician']);

        $product = $report->job->product;
        $technician = $report->technician;

        $components = [
            'Baterai' => ['status' => $report->battery_status,  'notes' => $report->battery_notes],
            'Layar' => ['status' => $report->screen_status,   'notes' => $report->screen_notes],
            'Keyboard' => ['status' => $report->keyboard_status, 'notes' => $report->keyboard_notes],
            'Touchpad' => ['status' => $report->touchpad_status, 'notes' => $report->touchpad_notes],
            'Port I/O' => ['status' => $report->port_status,     'notes' => $report->port_notes],
            'Storage' => ['status' => $report->storage_status,  'notes' => $report->storage_notes],
            'RAM' => ['status' => $report->ram_status,      'notes' => $report->ram_notes],
            'CPU' => ['status' => $report->cpu_status,      'notes' => $report->cpu_notes],
            'Kondisi Fisik' => ['status' => $report->physical_status, 'notes' => $report->physical_notes],
        ];

        $filename = 'inspections/'.$report->id.'.pdf';

        $pdf = Pdf::loadView('pdf.inspection_report', compact(
            'report',
            'product',
            'technician',
            'components'
        ))
            ->setPaper('a4', 'portrait')
            ->setOption('isHtml5ParserEnabled', true)
            ->setOption('isRemoteEnabled', false)
            ->setOption('defaultFont', 'sans-serif');

        $pdfContent = $pdf->output();

        Storage::disk('public')->put($filename, $pdfContent);

        $report->update(['pdf_url' => $filename]);

        return $filename;
    }
}
