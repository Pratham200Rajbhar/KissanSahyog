from app.schemas.schedule import IrrigationScheduleInput, IrrigationScheduleOutput, IrrigationDay

async def schedule_irrigation(input_data: IrrigationScheduleInput) -> IrrigationScheduleOutput:
    # TODO: Replace with real model call
    return IrrigationScheduleOutput(
        schedule=[
            IrrigationDay(day="Monday", irrigate=True, amount_mm=15.0),
            IrrigationDay(day="Tuesday", irrigate=False, amount_mm=0.0),
            IrrigationDay(day="Wednesday", irrigate=False, amount_mm=0.0),
            IrrigationDay(day="Thursday", irrigate=True, amount_mm=20.0),
            IrrigationDay(day="Friday", irrigate=False, amount_mm=0.0),
            IrrigationDay(day="Saturday", irrigate=False, amount_mm=0.0),
            IrrigationDay(day="Sunday", irrigate=True, amount_mm=10.0),
        ]
    )
