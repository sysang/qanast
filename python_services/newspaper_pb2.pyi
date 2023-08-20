from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from typing import ClassVar as _ClassVar, Optional as _Optional

DESCRIPTOR: _descriptor.FileDescriptor

class NewspaperRequest(_message.Message):
    __slots__ = ["html"]
    HTML_FIELD_NUMBER: _ClassVar[int]
    html: str
    def __init__(self, html: _Optional[str] = ...) -> None: ...

class NewspaperReply(_message.Message):
    __slots__ = ["content"]
    CONTENT_FIELD_NUMBER: _ClassVar[int]
    content: str
    def __init__(self, content: _Optional[str] = ...) -> None: ...
