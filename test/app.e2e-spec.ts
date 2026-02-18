import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('Chrysallis API (e2e)', () => {
  let app: INestApplication<App>;
  let missionId: string;
  let stepId: string;
  let reportId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  // ====== HEALTH ======

  describe('Health', () => {
    it('GET /health → retourne status ok', () => {
      return request(app.getHttpServer())
        .get('/health')
        .expect(200)
        .expect((res) => {
          expect(res.body.status).toBe('ok');
        });
    });

    it('GET /health/readiness → retourne status ok', () => {
      return request(app.getHttpServer())
        .get('/health/readiness')
        .expect(200)
        .expect((res) => {
          expect(res.body.status).toBe('ok');
        });
    });

    it('GET /health/liveness → retourne status ok', () => {
      return request(app.getHttpServer())
        .get('/health/liveness')
        .expect(200)
        .expect((res) => {
          expect(res.body.status).toBe('ok');
        });
    });
  });

  // ====== MISSIONS ======

  describe('Missions', () => {
    it('GET /missions → retourne un tableau', () => {
      return request(app.getHttpServer())
        .get('/missions')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });

    it('POST /missions → crée une mission', () => {
      return request(app.getHttpServer())
        .post('/missions')
        .send({
          title: 'Opération Fantôme',
          codeName: 'GHOST-01',
          description: 'Mission de surveillance',
          classificationLevel: 'SECRET',
          agentId: 'agent-007',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.id).toBeDefined();
          expect(res.body.title).toBe('Opération Fantôme');
          expect(res.body.status).toBe('ASSIGNED');
          missionId = res.body.id;
        });
    });

    it('GET /missions/:id → retourne la mission créée', () => {
      return request(app.getHttpServer())
        .get(`/missions/${missionId}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(missionId);
          expect(res.body.codeName).toBe('GHOST-01');
        });
    });

    it('PUT /missions/:id → met à jour la mission', () => {
      return request(app.getHttpServer())
        .put(`/missions/${missionId}`)
        .send({ status: 'IN_PROGRESS', location: 'Paris' })
        .expect(200)
        .expect((res) => {
          expect(res.body.status).toBe('IN_PROGRESS');
          expect(res.body.location).toBe('Paris');
        });
    });

    it('PATCH /missions/:id/complete → marque la mission terminée', () => {
      return request(app.getHttpServer())
        .patch(`/missions/${missionId}/complete`)
        .expect(200)
        .expect((res) => {
          expect(res.body.status).toBe('COMPLETED');
        });
    });
  });

  // ====== STEPS ======

  describe('Steps', () => {
    it('POST /missions/:id/steps → crée une étape', () => {
      return request(app.getHttpServer())
        .post(`/missions/${missionId}/steps`)
        .send({
          description: 'Infiltrer le bâtiment',
          assignedAgent: 'agent-007',
          status: 'PENDING',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.id).toBeDefined();
          expect(res.body.description).toBe('Infiltrer le bâtiment');
          stepId = res.body.id;
        });
    });

    it('GET /missions/:id/steps → retourne les étapes de la mission', () => {
      return request(app.getHttpServer())
        .get(`/missions/${missionId}/steps`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeGreaterThan(0);
        });
    });

    it('PUT /missions/:id/steps/:stepId → met à jour une étape', () => {
      return request(app.getHttpServer())
        .put(`/missions/${missionId}/steps/${stepId}`)
        .send({ status: 'DONE' })
        .expect(200)
        .expect((res) => {
          expect(res.body.status).toBe('DONE');
        });
    });

    it('DELETE /missions/:id/steps/:stepId → supprime une étape', () => {
      return request(app.getHttpServer())
        .delete(`/missions/${missionId}/steps/${stepId}`)
        .expect(200);
    });
  });

  // ====== FIELD REPORTS ======

  describe('Field Reports', () => {
    it('POST /missions/:id/reports → crée un rapport', () => {
      return request(app.getHttpServer())
        .post(`/missions/${missionId}/reports`)
        .send({
          details: 'Contact établi avec la cible',
          authorAgent: 'agent-007',
          location: 'Paris 8ème',
          latitude: 48.8736,
          longitude: 2.2975,
          status: 'submitted',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.id).toBeDefined();
          expect(res.body.details).toBe('Contact établi avec la cible');
          reportId = res.body.id;
        });
    });

    it('GET /missions/:id/reports → retourne les rapports de la mission', () => {
      return request(app.getHttpServer())
        .get(`/missions/${missionId}/reports`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeGreaterThan(0);
        });
    });

    it('PUT /missions/:id/reports/:reportId → met à jour un rapport', () => {
      return request(app.getHttpServer())
        .put(`/missions/${missionId}/reports/${reportId}`)
        .send({ status: 'reviewed' })
        .expect(200)
        .expect((res) => {
          expect(res.body.status).toBe('reviewed');
        });
    });

    it('DELETE /missions/:id/reports/:reportId → supprime un rapport', () => {
      return request(app.getHttpServer())
        .delete(`/missions/${missionId}/reports/${reportId}`)
        .expect(200);
    });
  });

  // ====== NETTOYAGE ======

  describe('Nettoyage', () => {
    it('DELETE /missions/:id → supprime la mission de test', () => {
      return request(app.getHttpServer())
        .delete(`/missions/${missionId}`)
        .expect(200);
    });

    it('GET /missions/:id → retourne 404 après suppression', () => {
      return request(app.getHttpServer())
        .get(`/missions/${missionId}`)
        .expect(404);
    });
  });
});
 // npm run test:e2e //