import {
  IsArray,
  IsInt,
  ValidateNested,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';

export class SelectionItemDto {
  @IsInt({ message: 'El ID del beneficiario es obligatorio.' })
  beneficiaryId: number;

  @IsInt({ message: 'El ID del regalo es obligatorio.' })
  giftId: number;
}

export class ConfirmSelectionDto {
  @IsArray({ message: 'Debes enviar al menos un beneficiario.' })
  @ArrayMinSize(1, { message: 'Debes seleccionar al menos un regalo.' })
  @ValidateNested({ each: true })
  @Type(() => SelectionItemDto)
  items: SelectionItemDto[];
}
