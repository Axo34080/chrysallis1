import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { User } from './entities/user.entity';
import { Post } from './entities/post.entity';
import { Mission } from './entities/mission.entity';
import { Step } from './entities/step.entity';
import { FieldReport } from './entities/field-report.entity';
import { MissionModule } from './mission/mission.module';
import { StepsModule } from './steps/steps.module';
import { FieldReportsModule } from './field-reports/field-reports.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DATABASE_HOST || 'localhost',
      port: parseInt(process.env.DATABASE_PORT || '5432', 10),
      username: process.env.DATABASE_USER || 'postgres',
      password: process.env.DATABASE_PASSWORD || 'changeme',
      database: process.env.DATABASE_NAME || 'chrysallis_db',
      entities: [User, Post, Mission, Step, FieldReport],
      synchronize: process.env.NODE_ENV !== 'production', // only in development
    }),
    MissionModule,
    StepsModule,
    FieldReportsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
