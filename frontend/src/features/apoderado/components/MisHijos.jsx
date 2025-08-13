// src/features/apoderados/components/MisHijos.jsx
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { obtenerMisHijos } from '../../../api/alumnos';

export default function MisHijos() {
  const [hijos, setHijos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await obtenerMisHijos();
        setHijos(Array.isArray(data) ? data : []);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return <div className="p-6 text-sm text-gray-500">Cargando hijos…</div>;
  }

  if (!hijos.length) {
    return <div className="p-6 text-sm text-gray-500">No hay hijos registrados.</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {hijos.map(h => (
        <Card key={h.id} className="overflow-hidden">
          <CardHeader>
            <CardTitle className="text-lg">{h.nombre_completo || `Alumno ${h.id}`}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-gray-700">
            {h.nombre_nivel && h.nombre_curso ? (
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{h.nombre_nivel}</Badge>
                <span>{h.nombre_curso}</span>
                {h.ano_escolar ? <span className="text-gray-500">· {h.ano_escolar}</span> : null}
              </div>
            ) : (
              <div className="text-gray-500">Sin curso asignado</div>
            )}
            {h.fecha_nacimiento ? (
              <div>
                <span className="text-gray-500">Fecha de nacimiento: </span>
                {String(h.fecha_nacimiento).slice(0,10)}
              </div>
            ) : null}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
