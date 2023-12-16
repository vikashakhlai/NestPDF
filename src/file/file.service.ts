import { Injectable, NotFoundException } from '@nestjs/common';
import { path } from 'app-root-path';
import * as fs from 'fs';
import { ensureDir, writeFile } from 'fs-extra';
import * as path2 from 'path';
import * as PdfPrinter from 'pdfmake';
import { PrismaService } from 'src/prisma.service';
import { uuid } from 'uuidv4';
import { FileDto } from './file.dto';
import { FileResponse } from './file.interface';

@Injectable()
export class FileService {
	constructor(private prisma: PrismaService) {}

	async saveFiles(
		files: Express.Multer.File[],
		folder: string = 'default'
	): Promise<FileResponse[]> {
		const uploadFolder = `${path}/uploads/${folder}`;
		await ensureDir(uploadFolder);

		if (files === undefined) throw new NotFoundException('File not found');

		const res: FileResponse[] = await Promise.all(
			files.map(async (file) => {
				if (file === undefined) throw new NotFoundException('File not found');
				await writeFile(`${uploadFolder}/${file.originalname}`, file.buffer);

				return {
					url: `/uploads/${folder}/${file.originalname}`,
					name: `${file.originalname}`,
				};
			})
		);

		return res;
	}

	async createPDF(dto: FileDto) {
		const user = await this.prisma.user.findFirst({
			where: {
				email: dto.email,
			},
		});
		if (!user) throw new NotFoundException('User not found');
		const text = user.firstName + ' ' + user.lastName + ' ';

		if (user.image === '') throw new NotFoundException('Image not found');

		if (!fs.existsSync(path2.join(__dirname, `../../${user.image}`)))
			throw new NotFoundException('Image file not found');

		const base64String = fs.readFileSync(
			path2.join(__dirname, `../../${user.image}`),
			'base64'
		);

		const fonts = {
			Helvetica: {
				normal: 'Helvetica',
				bold: 'Helvetica-Bold',
				italics: 'Helvetica-Oblique',
				bolditalics: 'Helvetica-BoldOblique',
			},
		};
		const printer = new PdfPrinter(fonts);

		const docDefinition = {
			content: [
				[text],
				{
					height: 200,
					width: 200,
					image: `data:image/jpeg;base64,${base64String}`,
				},
			],
			defaultStyle: {
				font: 'Helvetica',
				fontSize: 24,
			},
		};

		const options = {};
		const file_name = 'PDF' + uuid() + '.pdf';
		const pdfDoc = printer.createPdfKitDocument(docDefinition, options);

		pdfDoc.pipe(
			fs.createWriteStream(
				path2.join(__dirname, `../../uploads/pdf/${file_name}`)
			)
		);
		pdfDoc.end();

		const pdf = Buffer.from(
			path2.join(__dirname, `../../uploads/pdf/${file_name}`)
		);

		await this.prisma.user.update({
			where: {
				email: dto.email,
			},
			data: {
				pdf: pdf,
			},
		});

		return { success: true };
	}
}
