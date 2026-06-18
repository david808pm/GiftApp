import {
  IsString,
  IsOptional,
  IsBoolean,
  MinLength,
  MaxLength,
} from 'class-validator';

export class CreateCompanyDto {
  @IsString({ message: 'El nombre es obligatorio.' })
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres.' })
  @MaxLength(180, { message: 'El nombre no puede superar 180 caracteres.' })
  name: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  slug?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
