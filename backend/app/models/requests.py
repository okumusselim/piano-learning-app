from pydantic import BaseModel


class OMRProcessRequest(BaseModel):
    sheet_id: str
    page_number: int = 0
