from fastapi import APIRouter

from . import (
    adc,
    ai_models,
    auth,
    config,
    defect_histogram,
    datasets,
    delete_queue,
    designs,
    jobs,
    models,
    nodes,
    results,
    storage,
    test_run,
    tool_data,
    trainings,
    users,
)

router = APIRouter()

router.include_router(adc.router, prefix="/adc", tags=["adc"])
router.include_router(ai_models.router, prefix="/ai-model", tags=["ai-model"])
router.include_router(auth.router, prefix="/auth", tags=["auth"])
router.include_router(config.router, prefix="/config", tags=["config"])
router.include_router(
    defect_histogram.router, prefix="/results", tags=["defect-histogram"]
)
router.include_router(designs.router, prefix="/designs", tags=["designs"])
router.include_router(jobs.router, prefix="/jobs", tags=["jobs"])
router.include_router(models.router, prefix="/models", tags=["models"])
router.include_router(results.router, prefix="/results", tags=["results"])
router.include_router(storage.router, prefix="/storage", tags=["storage"])
router.include_router(test_run.router, prefix="/test-run", tags=["test-run"])
router.include_router(tool_data.router, prefix="/tool-data", tags=["tool-data"])
router.include_router(trainings.router, prefix="/trainings", tags=["trainings"])
router.include_router(users.router, prefix="/users", tags=["users"])
router.include_router(nodes.router, prefix="/nodes", tags=["nodes"])
router.include_router(datasets.router, prefix="/datasets", tags=["datasets"])
router.include_router(
    delete_queue.router, prefix="/delete-queue", tags=["delete-queue"]
)
