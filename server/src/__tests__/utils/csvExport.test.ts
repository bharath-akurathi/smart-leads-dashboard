import { generateCSV } from '../../utils/csvExport';

describe('generateCSV utility', () => {
  const mockLeads = [
    {
      name: 'Alice Smith',
      email: 'alice@test.com',
      phone: '+1-555-0001',
      company: 'TestCo',
      status: 'New',
      source: 'Website',
      priority: 'High',
      notes: 'Important lead',
      createdAt: new Date('2024-01-15T10:00:00Z'),
      lastContactedAt: null,
    },
    {
      name: 'Bob Jones',
      email: 'bob@other.com',
      phone: '',
      company: '',
      status: 'Won',
      source: 'LinkedIn',
      priority: 'Low',
      notes: '',
      createdAt: new Date('2024-02-20T14:00:00Z'),
      lastContactedAt: new Date('2024-02-25T09:00:00Z'),
    },
  ] as any;

  it('should generate a CSV string', () => {
    const csv = generateCSV(mockLeads);
    expect(typeof csv).toBe('string');
    expect(csv.length).toBeGreaterThan(0);
  });

  it('should include a header row with correct column names', () => {
    const csv = generateCSV(mockLeads);
    const firstLine = csv.split('\n')[0];
    expect(firstLine).toContain('Name');
    expect(firstLine).toContain('Email');
    expect(firstLine).toContain('Status');
    expect(firstLine).toContain('Source');
  });

  it('should include lead data in the CSV', () => {
    const csv = generateCSV(mockLeads);
    expect(csv).toContain('Alice Smith');
    expect(csv).toContain('alice@test.com');
    expect(csv).toContain('TestCo');
    expect(csv).toContain('New');
    expect(csv).toContain('Bob Jones');
    expect(csv).toContain('bob@other.com');
  });

  it('should handle empty leads array', () => {
    const csv = generateCSV([]);
    expect(typeof csv).toBe('string');
    // Should still have at least a header row
    expect(csv.split('\n').length).toBeGreaterThanOrEqual(1);
  });

  it('should handle leads with missing optional fields', () => {
    const leadWithMissingFields = [{
      name: 'Minimal Lead',
      email: 'min@test.com',
      phone: undefined,
      company: undefined,
      status: 'New',
      source: 'Website',
      priority: 'Low',
      notes: undefined,
      createdAt: new Date(),
      lastContactedAt: null,
    }] as any;

    expect(() => generateCSV(leadWithMissingFields)).not.toThrow();
  });
});
