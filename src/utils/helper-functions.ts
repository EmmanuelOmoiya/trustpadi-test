import { HttpException, HttpStatus } from "@nestjs/common";

export const handlePagination = (page: number, limit: number): { page: number; limit: number } => {
  return { page: +(page ?? 1), limit: +(limit ?? 10) };
};

export function joinFirstNameAndLastname(firstName: string, lastName: string): string {
  return `${firstName} ${lastName}`;
}

export function capitalize(string: string): string {
  return string.charAt(0).toUpperCase() + string.substring(1).toLowerCase();
}

export const paginate = (
  total: number,
  limit: number,
): { totalPages: number; totalCount: number } => {
  const totalPages: number = total ? Math.ceil(total / limit) : 0;
  const totalCount: number = total ? total : 0;
  return { totalPages, totalCount };
};

export const errorHandler = (error: Error) => {
  if (error instanceof HttpException) {
    throw new HttpException(error.getResponse(), error.getStatus());
  } else {
    throw new HttpException({ ...error }, HttpStatus.INTERNAL_SERVER_ERROR);
  }
};

export const addCommaToAmount = (value: number): string | undefined => {
  const options = { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 };
  return value.toLocaleString('en-US');
};