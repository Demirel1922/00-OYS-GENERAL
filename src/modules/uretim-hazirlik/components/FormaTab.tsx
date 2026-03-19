import type { UretimHazirlikKaydi, FormaCesidi } from '../types';
import { FORMA_PARAMETRE_CONFIG } from '../types';
import { LookupSelect, FieldInput, FormField } from './FormComponents';

export function FormaTab({ kayit, locked, updateField }: {
  kayit: UretimHazirlikKaydi; locked: boolean;
  updateField: (f: string, v: any) => void;
}) {
  const f = kayit.forma;
  const config = f.formaCesidi ? FORMA_PARAMETRE_CONFIG[f.formaCesidi] : null;

  const updateParam = (idx: number, value: string) => {
    const params = [...f.parametreler];
    params[idx] = { ...params[idx], deger: value };
    updateField('parametreler', params);
  };

  const updateKalip = (idx: number, value: string) => {
    const kaliplar = [...f.kalipNolari];
    kaliplar[idx] = value;
    updateField('kalipNolari', kaliplar);
  };

  const handleCesidiChange = (v: string) => {
    updateField('formaCesidi', v as FormaCesidi);
    if (v && FORMA_PARAMETRE_CONFIG[v]) {
      const cfg = FORMA_PARAMETRE_CONFIG[v];
      const etiketler = [cfg.etiket1, cfg.etiket2, cfg.etiket3, cfg.etiket4, cfg.etiket5, cfg.etiket6];
      const params = etiketler.map((e, i) => ({ etiket: e, deger: f.parametreler[i]?.deger || '' }));
      updateField('parametreler', params);
    }
  };

  return (
    <div className="space-y-6">
      <FormField label="Forma Çeşidi" required>
        <LookupSelect
          value={f.formaCesidi}
          onChange={handleCesidiChange}
          options={['EL_KALIBI', 'CORTESE', 'TECNOPEA']}
          disabled={locked}
          className="max-w-xs"
        />
      </FormField>

      {config && (
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-700">Parametreler ({f.formaCesidi?.replace('_', ' ')})</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {f.parametreler.map((p, idx) => (
              p.etiket ? (
                <FormField key={idx} label={p.etiket}>
                  <FieldInput value={p.deger} onChange={v => updateParam(idx, v)} disabled={locked} type="number" />
                </FormField>
              ) : null
            ))}
          </div>
        </div>
      )}

      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-2">Kalıp Numaraları (Boy bazlı)</h3>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          {f.kalipNolari.map((kn, idx) => (
            <FormField key={idx} label={`Kalıp No ${idx + 1}`}>
              <FieldInput value={kn} onChange={v => updateKalip(idx, v)} disabled={locked} />
            </FormField>
          ))}
        </div>
      </div>
    </div>
  );
}
