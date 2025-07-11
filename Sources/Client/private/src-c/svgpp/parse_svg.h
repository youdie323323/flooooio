#include <stdint.h>

typedef struct {
    uint16_t id;
} CanvasContext;

#ifdef __cplusplus
extern "C" {
#endif

void parseSvg(const char* svgText, CanvasContext* ctx);

#ifdef __cplusplus
}
#endif