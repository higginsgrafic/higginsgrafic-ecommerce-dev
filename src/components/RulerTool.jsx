import { useState, useEffect, useRef } from 'react';
import { Ruler, X } from 'lucide-react';
import { Button } from './ui/button';

export default function RulerTool() {
  const [isActive, setIsActive] = useState(false);
  const [points, setPoints] = useState([]);
  const [mode, setMode] = useState('distance');
  const [measurements, setMeasurements] = useState([]);
  const canvasRef = useRef(null);

  useEffect(() => {
    window.__RULER_TOOL_ACTIVE__ = !!isActive;
    return () => {
      window.__RULER_TOOL_ACTIVE__ = false;
    };
  }, [isActive]);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'r' && e.ctrlKey) {
        e.preventDefault();
        setIsActive(prev => !prev);
      }
      if (e.key === 'Escape' && isActive) {
        setPoints([]);
      }
      if (e.key === 'm' && isActive) {
        setMode(prev => prev === 'distance' ? 'angle' : 'distance');
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isActive]);

  useEffect(() => {
    if (!isActive) {
      setPoints([]);
      setMeasurements([]);
      return;
    }

    const handleClick = (e) => {
      // Do not hijack normal interactions. Only measure on modifier-click.
      if (!e.shiftKey && !e.altKey) {
        return;
      }

      let element = e.target;
      while (element && element !== document.body) {
        if (
          (element.classList && element.classList.contains('debug-exempt')) ||
          (element.className && typeof element.className === 'string' && element.className.includes('debug-exempt'))
        ) {
          // Still allow measuring on exempt UI if user modifier-clicks.
          break;
        }
        element = element.parentElement;
      }

      const point = { x: e.clientX, y: e.clientY };

      setPoints(prev => {
        const newPoints = [...prev, point];

        if (mode === 'distance' && newPoints.length === 2) {
          const distance = Math.sqrt(
            Math.pow(newPoints[1].x - newPoints[0].x, 2) +
            Math.pow(newPoints[1].y - newPoints[0].y, 2)
          );

          setMeasurements(prevMeasurements => [...prevMeasurements, {
            type: 'distance',
            points: [...newPoints],
            value: distance
          }]);

          return [];
        }

        if (mode === 'angle' && newPoints.length === 3) {
          const angle = calculateAngle(newPoints[0], newPoints[1], newPoints[2]);

          setMeasurements(prevMeasurements => [...prevMeasurements, {
            type: 'angle',
            points: [...newPoints],
            value: angle
          }]);

          return [];
        }

        return newPoints;
      });
    };

    window.addEventListener('click', handleClick, true);
    return () => window.removeEventListener('click', handleClick, true);
  }, [isActive, mode]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !isActive) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = '#3b82f6';
    ctx.fillStyle = '#3b82f6';
    ctx.lineWidth = 2;

    measurements.forEach(measurement => {
      if (measurement.type === 'distance') {
        drawDistance(ctx, measurement.points, measurement.value);
      } else if (measurement.type === 'angle') {
        drawAngle(ctx, measurement.points, measurement.value);
      }
    });

    if (points.length > 0) {
      points.forEach((point, index) => {
        ctx.beginPath();
        ctx.arc(point.x, point.y, 5, 0, 2 * Math.PI);
        ctx.fill();

        if (index > 0) {
          ctx.beginPath();
          ctx.moveTo(points[index - 1].x, points[index - 1].y);
          ctx.lineTo(point.x, point.y);
          ctx.stroke();
        }
      });

      if (mode === 'distance' && points.length === 2) {
        const midX = (points[0].x + points[1].x) / 2;
        const midY = (points[0].y + points[1].y) / 2;
        const distance = Math.sqrt(
          Math.pow(points[1].x - points[0].x, 2) +
          Math.pow(points[1].y - points[0].y, 2)
        );

        drawLabel(ctx, midX, midY, `${distance.toFixed(1)}px`);
      }

      if (mode === 'angle' && points.length === 3) {
        const angle = calculateAngle(points[0], points[1], points[2]);
        drawLabel(ctx, points[1].x, points[1].y - 20, `${angle.toFixed(1)}°`);
      }
    }
  }, [isActive, points, measurements, mode]);

  const calculateAngle = (p1, p2, p3) => {
    const angle1 = Math.atan2(p1.y - p2.y, p1.x - p2.x);
    const angle2 = Math.atan2(p3.y - p2.y, p3.x - p2.x);
    let angle = (angle2 - angle1) * (180 / Math.PI);

    if (angle < 0) angle += 360;
    if (angle > 180) angle = 360 - angle;

    return angle;
  };

  const drawDistance = (ctx, points, distance) => {
    ctx.strokeStyle = '#10b981';
    ctx.fillStyle = '#10b981';
    ctx.setLineDash([5, 5]);

    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    ctx.lineTo(points[1].x, points[1].y);
    ctx.stroke();

    points.forEach(point => {
      ctx.beginPath();
      ctx.arc(point.x, point.y, 4, 0, 2 * Math.PI);
      ctx.fill();
    });

    const midX = (points[0].x + points[1].x) / 2;
    const midY = (points[0].y + points[1].y) / 2;
    drawLabel(ctx, midX, midY, `${distance.toFixed(1)}px`, '#10b981');

    ctx.setLineDash([]);
  };

  const drawAngle = (ctx, points, angle) => {
    ctx.strokeStyle = '#f59e0b';
    ctx.fillStyle = '#f59e0b';
    ctx.setLineDash([5, 5]);

    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    ctx.lineTo(points[1].x, points[1].y);
    ctx.lineTo(points[2].x, points[2].y);
    ctx.stroke();

    const arcRadius = 30;
    const angle1 = Math.atan2(points[0].y - points[1].y, points[0].x - points[1].x);
    const angle2 = Math.atan2(points[2].y - points[1].y, points[2].x - points[1].x);

    ctx.beginPath();
    ctx.arc(points[1].x, points[1].y, arcRadius, angle1, angle2);
    ctx.stroke();

    points.forEach(point => {
      ctx.beginPath();
      ctx.arc(point.x, point.y, 4, 0, 2 * Math.PI);
      ctx.fill();
    });

    drawLabel(ctx, points[1].x, points[1].y - 45, `${angle.toFixed(1)}°`, '#f59e0b');

    ctx.setLineDash([]);
  };

  const drawLabel = (ctx, x, y, text, color = '#3b82f6') => {
    ctx.fillStyle = 'white';
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;

    const padding = 6;
    const metrics = ctx.measureText(text);
    const width = metrics.width + padding * 2;
    const height = 20;

    ctx.fillRect(x - width / 2, y - height / 2, width, height);
    ctx.strokeRect(x - width / 2, y - height / 2, width, height);

    ctx.fillStyle = color;
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, x, y);
  };

  const clearMeasurements = () => {
    setMeasurements([]);
    setPoints([]);
  };

  return (
    <>
      <button
        onClick={() => setIsActive((prev) => !prev)}
        className={`fixed bottom-4 right-4 text-white p-3 rounded-full shadow-lg transition-colors debug-exempt ${isActive ? 'bg-blue-700 hover:bg-blue-800' : 'bg-blue-600 hover:bg-blue-700'}`}
        style={{ zIndex: 99999 }}
        title={isActive ? 'Desactivar regle (Ctrl+R)' : 'Activar regle (Ctrl+R)'}
      >
        <Ruler className="w-5 h-5" />
      </button>

      {!isActive ? null : (
        <>
          <canvas
            ref={canvasRef}
            className="fixed inset-0 pointer-events-none debug-exempt"
            style={{ zIndex: 99999, cursor: 'crosshair' }}
          />

          <div className="fixed top-4 right-4 bg-background rounded-lg shadow-xl p-4 border-2 border-blue-500 min-w-[280px] debug-exempt" style={{ zIndex: 99999 }}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Ruler className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-foreground">Eina de Mesura</h3>
              </div>
              <button
                onClick={() => setIsActive(false)}
                className="text-muted-foreground hover:text-foreground"
                title="Tancar (Ctrl+R)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

        <div className="space-y-3">
          <div className="flex gap-2">
            <Button
              onClick={() => setMode('distance')}
              variant={mode === 'distance' ? 'default' : 'outline'}
              size="sm"
              className="flex-1"
            >
              Distància
            </Button>
            <Button
              onClick={() => setMode('angle')}
              variant={mode === 'angle' ? 'default' : 'outline'}
              size="sm"
              className="flex-1"
            >
              Angle
            </Button>
          </div>

          <div className="bg-muted rounded p-3 space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Mode actual:</span>
              <span className="font-semibold text-foreground">
                {mode === 'distance' ? 'Distància' : 'Angle'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Punts seleccionats:</span>
              <span className="font-semibold text-foreground">
                {points.length} / {mode === 'distance' ? '2' : '3'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Mesures guardades:</span>
              <span className="font-semibold text-foreground">
                {measurements.length}
              </span>
            </div>
          </div>

          <div className="space-y-1.5 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <kbd className="px-1.5 py-0.5 bg-muted rounded font-mono">Ctrl+R</kbd>
              <span>Activar/Desactivar</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="px-1.5 py-0.5 bg-muted rounded font-mono">M</kbd>
              <span>Canviar mode</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="px-1.5 py-0.5 bg-muted rounded font-mono">Esc</kbd>
              <span>Cancel·lar mesura actual</span>
            </div>
          </div>

          <div className="pt-2 border-t border-border space-y-2">
            <Button
              onClick={clearMeasurements}
              variant="outline"
              size="sm"
              className="w-full"
              disabled={measurements.length === 0 && points.length === 0}
            >
              Esborrar Tot
            </Button>
          </div>

          {mode === 'distance' && (
            <div className="text-xs text-muted-foreground bg-muted/60 p-2 rounded">
              Shift+Click (o Alt+Click) en dos punts per mesurar la distància
            </div>
          )}

          {mode === 'angle' && (
            <div className="text-xs text-muted-foreground bg-muted/60 p-2 rounded">
              Shift+Click (o Alt+Click) en tres punts per mesurar l'angle (el segon punt és el vèrtex)
            </div>
          )}
        </div>
          </div>
        </>
      )}
    </>
  );
}
