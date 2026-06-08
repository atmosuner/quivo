# Temporary Quivo PWA icons — replace with final brand assets later.
# Generates PNG icons from brand colors matching public/icons/icon.svg.

Add-Type -AssemblyName System.Drawing

function Draw-QuivoIcon {
    param(
        [int]$Size,
        [string]$OutputPath,
        [double]$ContentScale = 1.0
    )

    $bmp = New-Object System.Drawing.Bitmap($Size, $Size)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic

    $g.Clear([System.Drawing.Color]::FromArgb(255, 250, 249, 252))

    $margin = [int]($Size * (1 - $ContentScale) / 2)
    $inner = $Size - ($margin * 2)
    $radius = [int]($inner * 0.22)

    $path = New-Object System.Drawing.Drawing2D.GraphicsPath
    $path.AddArc($margin, $margin, $radius * 2, $radius * 2, 180, 90)
    $path.AddArc($Size - $margin - $radius * 2, $margin, $radius * 2, $radius * 2, 270, 90)
    $path.AddArc($Size - $margin - $radius * 2, $Size - $margin - $radius * 2, $radius * 2, $radius * 2, 0, 90)
    $path.AddArc($margin, $Size - $margin - $radius * 2, $radius * 2, $radius * 2, 90, 90)
    $path.CloseFigure()

    $brush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
        [System.Drawing.Rectangle]::new($margin, $margin, $inner, $inner),
        [System.Drawing.Color]::FromArgb(255, 123, 106, 230),
        [System.Drawing.Color]::FromArgb(255, 90, 70, 200),
        45
    )
    $g.FillPath($brush, $path)

    $bolt = New-Object System.Drawing.Drawing2D.GraphicsPath
    $s = $inner / 512.0
    $ox = $margin
    $oy = $margin
    $bolt.AddPolygon(@(
        [System.Drawing.PointF]::new($ox + 286 * $s, $oy + 118 * $s),
        [System.Drawing.PointF]::new($ox + 162 * $s, $oy + 318 * $s),
        [System.Drawing.PointF]::new($ox + 280 * $s, $oy + 318 * $s),
        [System.Drawing.PointF]::new($ox + 258 * $s, $oy + 494 * $s),
        [System.Drawing.PointF]::new($ox + 454 * $s, $oy + 236 * $s),
        [System.Drawing.PointF]::new($ox + 298 * $s, $oy + 236 * $s)
    ))
    $g.FillPath([System.Drawing.Brushes]::White, $bolt)

    $dir = Split-Path $OutputPath -Parent
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
    }
    $bmp.Save($OutputPath, [System.Drawing.Imaging.ImageFormat]::Png)

    $g.Dispose()
    $bmp.Dispose()
    $brush.Dispose()
    $path.Dispose()
    $bolt.Dispose()
}

$root = Split-Path $PSScriptRoot -Parent
$iconDir = Join-Path $root 'public\icons'

Draw-QuivoIcon -Size 192 -OutputPath (Join-Path $iconDir 'icon-192.png') -ContentScale 1.0
Draw-QuivoIcon -Size 512 -OutputPath (Join-Path $iconDir 'icon-512.png') -ContentScale 1.0
Draw-QuivoIcon -Size 512 -OutputPath (Join-Path $iconDir 'icon-maskable-512.png') -ContentScale 0.78

Write-Host 'Generated temporary Quivo PNG icons in public/icons/'
