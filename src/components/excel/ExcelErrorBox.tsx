interface ExcelErrorBoxProps {
  errors: string[];
}

export function ExcelErrorBox({ errors }: ExcelErrorBoxProps) {
  if (!errors.length) return null;
  
  return (
    <div className="bg-red-50 border border-red-200 rounded p-4 mb-4">
      <h4 className="text-red-700 font-semibold mb-2">Lütfen düzeltin:</h4>
      <ul className="list-disc list-inside text-red-600 text-sm space-y-1">
        {errors.map((e, i) => (
          <li key={i}>{e}</li>
        ))}
      </ul>
    </div>
  );
}
