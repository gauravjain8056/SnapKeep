import { describe, it, expect } from 'vitest';
import { ApiResponse } from '../src/utils/apiResponse.js';

describe('ApiResponse', () => {
  const mockRes = () => {
    const res = {};
    res.statusCode = 200;
    res.jsonPayload = null;
    res.status = (code) => {
      res.statusCode = code;
      return res;
    };
    res.json = (data) => {
      res.jsonPayload = data;
      return res;
    };
    return res;
  };

  it('should format standard success responses with default status 200', () => {
    const res = mockRes();
    const data = { id: '123', title: 'Test Item' };

    ApiResponse.success(res, data);

    expect(res.statusCode).toBe(200);
    expect(res.jsonPayload).toEqual({
      success: true,
      data
    });
  });

  it('should format standard error responses with custom status codes', () => {
    const res = mockRes();

    ApiResponse.error(res, 'Item not found', 'NOT_FOUND', 404, { itemId: '123' });

    expect(res.statusCode).toBe(404);
    expect(res.jsonPayload).toEqual({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'Item not found',
        details: { itemId: '123' }
      }
    });
  });
});
