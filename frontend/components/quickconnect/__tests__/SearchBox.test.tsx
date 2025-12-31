import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SearchBox } from '../SearchBox';

describe('SearchBox', () => {
  const mockOnChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('应该渲染搜索框', () => {
    render(<SearchBox value="" onChange={mockOnChange} />);
    
    const input = screen.getByPlaceholderText(/搜索 E-SOUL/i);
    expect(input).toBeInTheDocument();
  });

  it('应该显示输入值', () => {
    render(<SearchBox value="test" onChange={mockOnChange} />);
    
    const input = screen.getByPlaceholderText(/搜索 E-SOUL/i) as HTMLInputElement;
    expect(input.value).toBe('test');
  });

  it('应该防抖调用onChange', async () => {
    render(<SearchBox value="" onChange={mockOnChange} />);
    
    const input = screen.getByPlaceholderText(/搜索 E-SOUL/i);
    
    fireEvent.change(input, { target: { value: 't' } });
    fireEvent.change(input, { target: { value: 'te' } });
    fireEvent.change(input, { target: { value: 'test' } });
    
    // 在防抖时间之前，不应该调用
    expect(mockOnChange).not.toHaveBeenCalled();
    
    // 等待防抖时间
    jest.advanceTimersByTime(300);
    
    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledTimes(1);
      expect(mockOnChange).toHaveBeenCalledWith('test');
    });
  });

  it('应该显示清除按钮当有值时', () => {
    render(<SearchBox value="test" onChange={mockOnChange} />);
    
    const clearButton = screen.getByRole('button');
    expect(clearButton).toBeInTheDocument();
  });

  it('应该清除输入当点击清除按钮时', () => {
    const mockOnClear = jest.fn();
    render(<SearchBox value="test" onChange={mockOnChange} onClear={mockOnClear} />);
    
    const clearButton = screen.getByRole('button');
    fireEvent.click(clearButton);
    
    expect(mockOnChange).toHaveBeenCalledWith('');
    expect(mockOnClear).toHaveBeenCalledTimes(1);
  });
});



