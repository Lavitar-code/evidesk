type FilterOption = {
  value: string;
  label: string;
};

type FilterField = {
  key: string;
  label: string;
  value: string;
  options: FilterOption[];
  onChange: (value: string) => void;
};

type FilterBarProps = {
  fields: FilterField[];
};

export function FilterBar({ fields }: FilterBarProps) {
  if (fields.length === 0) {
    return null;
  }

  return (
    <div className="filter-bar">
      {fields.map((field) => (
        <div className="filter-field" key={field.key}>
          <label className="filter-label" htmlFor={`filter-${field.key}`}>
            {field.label}
          </label>

          <select
            className="filter-select"
            id={`filter-${field.key}`}
            onChange={(event) => field.onChange(event.target.value)}
            value={field.value}
          >
            {field.options.map((option) => (
              <option key={`${field.key}-${option.value}`} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      ))}
    </div>
  );
}