import { PaymentMethod } from './service-session.model';

describe('PaymentMethod', () => {
  it('should have correct enum values', () => {
    expect(PaymentMethod.CASH).toBe('cash');
    expect(PaymentMethod.TRANSFER).toBe('transfer');
    expect(PaymentMethod.OTHER).toBe('other');
  });

  it('should contain all payment methods', () => {
    const values = Object.values(PaymentMethod);
    expect(values).toHaveLength(3);
    expect(values).toContain('cash');
    expect(values).toContain('transfer');
    expect(values).toContain('other');
  });
});
