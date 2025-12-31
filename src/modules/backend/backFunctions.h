#ifndef BACK_FUNCTIONS_H
#define BACK_FUNCTIONS_H

#include "modules/globals.h"
#include "modules/utils/utilsFunctions.h"
#include "modules/log/logFunctions.h"
#include "modules/http/httpFunctions.h"
#include "modules/nvs/nvsFunctions.h"

bool backendLogin(
  const String& email,
  const String& password,
  String& outUserId,
  String& outAccess,
  String& outRefresh,
  String& outErr
);

bool backendGetPatios(String& outJson, String& outErr);

bool backendProvision(String& outMachineId, String& outErrFriendly);

#endif